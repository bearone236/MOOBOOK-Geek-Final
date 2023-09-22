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

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = false // すべてのオリジンを許可しない
	corsConfig.AllowOrigins = []string{
		"https://moobook-geek-final.vercel.app",
		"http://localhost:3000",
	}
	corsConfig.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type"}
	corsConfig.AllowCredentials = true // クレデンシャルを持つリクエストを許可
	router.Use(cors.New(corsConfig))

	imageDB = make([]ImageInfo, 0)

	router.POST("/upload", func(c *gin.Context) {
		imageDB = make([]ImageInfo, 0)
		file, _ := c.FormFile("file")
		f, _ := os.Create(file.Filename)
		defer f.Close()
		src, _ := file.Open()
		defer src.Close()
		io.Copy(f, src)

		// Check file extension, if pptx convert to PDF
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
		var wg sync.WaitGroup
		wg.Add(doc.NumPage())
		for n := 0; n < doc.NumPage(); n++ {
			go func(page int) {
				defer wg.Done()
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

		// Delete original and converted PDF file (if exists)
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
