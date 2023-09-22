package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image/jpeg"
	"io"
	"net"
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

	// CORSが起きないようにエラー処理
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"https://moobook-geek-final.vercel.app"}
	config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	config.AllowHeaders = []string{"Access-Control-Allow-Headers",
		"Content-Type",
	}
	router.Use(cors.New(config))

	imageDB = make([]ImageInfo, 0) // jsonデータがPOSTで重複されないように毎度スライスを初期化

	router.OPTIONS("/upload", func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "https://moobook-geek-final.vercel.app")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.JSON(http.StatusOK, struct{}{})
	})

	router.POST("/upload", func(c *gin.Context) {
		sem := make(chan struct{}, 20) // 同時に処理できるゴルーチンの数を制限します
		var wg sync.WaitGroup

		go func() {
			defer wg.Done()

			imageDB = make([]ImageInfo, 0)

			file, _ := c.FormFile("file")
			f, _ := os.Create(file.Filename)
			defer f.Close()
			src, _ := file.Open()
			defer src.Close()
			io.Copy(f, src)

			if strings.ToLower(filepath.Ext(file.Filename)) == ".pptx" {
				cmd := exec.Command("unoconv", "-f", "pdf", file.Filename)
				err := cmd.Run()
				if err != nil {
					fmt.Println("Error converting pptx to pdf:", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
					return
				}
				file.Filename = strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename)) + ".pdf"

				time.Sleep(1 * time.Second)
			}

			doc, _ := fitz.New(file.Filename)
			defer doc.Close()

			wg.Add(doc.NumPage())

			for n := 0; n < doc.NumPage(); n++ {
				sem <- struct{}{}
				go func(page int) {
					defer wg.Done()
					defer func() { <-sem }()
					img, _ := doc.Image(page)
					buf := new(bytes.Buffer)
					jpeg.Encode(buf, img, nil)
					str := base64.StdEncoding.EncodeToString(buf.Bytes())

					imageDB = append(imageDB, ImageInfo{
						ID:   page + 1,
						Data: str,
					})
				}(n)
			}

			wg.Wait()

			c.JSON(http.StatusOK, imageDB)

			os.Remove(file.Filename)
			if strings.ToLower(filepath.Ext(file.Filename)) == ".pdf" {
				os.Remove(strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename)) + ".pptx")
			}
		}()
	})

	port := os.Getenv("PORT")

	fmt.Println("Server started on port", port)

	// リクエストのキューイングとタイムアウトの設定
	l, _ := net.Listen("tcp", ":"+port)
	srv := &http.Server{
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	if err := srv.Serve(l); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
