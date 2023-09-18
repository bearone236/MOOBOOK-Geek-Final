package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image/jpeg"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/gen2brain/go-fitz"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type ImageInfo struct {
	ID   int    `json:"id"`
	Data string `json:"data"`
}

var imageDB []ImageInfo // 画像情報を格納するスライス

func main() {
	router := gin.Default()

	// CORSが起きないようにエラー回避処理
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	router.Use(cors.New(config))

	imageDB = make([]ImageInfo, 0) // jsonデータがPOSTで重複されないように毎度スライスを初期化

	router.POST("/upload", func(c *gin.Context) {
		imageDB = make([]ImageInfo, 0)

		file, _ := c.FormFile("file")
		f, _ := os.Create(file.Filename)
		defer f.Close()
		src, _ := file.Open()
		defer src.Close()
		io.Copy(f, src)

		// ファイル拡張子をチェック、pptxの場合はPDFに変換
		if strings.ToLower(filepath.Ext(file.Filename)) == ".pptx" {
			cmd := exec.Command("unoconv", "-f", "pdf", file.Filename)
			err := cmd.Run()
			if err != nil {
				fmt.Println("Error converting pptx to pdf:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
				return
			}
			file.Filename = strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename)) + ".pdf"

			time.Sleep(2 * time.Second)
		}

		doc, _ := fitz.New(file.Filename)
		defer doc.Close()

		var wg sync.WaitGroup
		wg.Add(doc.NumPage())

		for n := 0; n < doc.NumPage(); n++ {
			go func(page int) {
				defer wg.Done()
				img, _ := doc.Image(page)
				buf := new(bytes.Buffer)
				jpeg.Encode(buf, img, nil)
				str := base64.StdEncoding.EncodeToString(buf.Bytes())

				// 画像情報を追加
				imageDB = append(imageDB, ImageInfo{
					ID:   page + 1, // ページ番号をIDとして使用
					Data: str,
				})
			}(n)
		}

		wg.Wait()

		// クライアントに画像情報を返す
		c.JSON(http.StatusOK, imageDB)

		// 元のファイルと変換後のPDFファイル（存在する場合）を削除
		os.Remove(file.Filename)
		if strings.ToLower(filepath.Ext(file.Filename)) == ".pdf" {
			os.Remove(strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename)) + ".pptx")
		}
	})

	fmt.Println("Server started on port 8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}