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

var imageDB []ImageInfo

const maxConcurrency = 5

func main() {
	router := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = false
	corsConfig.AllowOrigins = []string{
		"https://moobook-geek-final.vercel.app",
		"http://localhost:3000",
	}
	corsConfig.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type"}
	corsConfig.AllowCredentials = true
	router.Use(cors.New(corsConfig))

	imageDB = make([]ImageInfo, 0)

	router.POST("/upload", func(c *gin.Context) {
		imageDB = make([]ImageInfo, 0)
		file, err := c.FormFile("file")
		if err != nil {
			fmt.Println("Error getting file:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "file upload failed"})
			return
		}
		tempFilePath := filepath.Join(os.TempDir(), file.Filename)
		f, err := os.Create(tempFilePath)
		if err != nil {
			fmt.Println("Error creating temporary file:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		defer f.Close()

		src, err := file.Open()
		if err != nil {
			fmt.Println("Error opening uploaded file:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		defer src.Close()

		if _, err := io.Copy(f, src); err != nil {
			fmt.Println("Error copying uploaded file to temp:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}

		if strings.ToLower(filepath.Ext(tempFilePath)) == ".pptx" {
			cmd := exec.Command("/usr/local/bin/unoconv", "-f", "pdf", tempFilePath) // この行を修正
			output, err := cmd.CombinedOutput()
			if err != nil {
				fmt.Printf("unoconv error: %s\nOutput:\n%s\n", err, output)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
				return
			}
			tempFilePath = strings.TrimSuffix(tempFilePath, filepath.Ext(tempFilePath)) + ".pdf"
			time.Sleep(1 * time.Second)
		}

		doc, err := fitz.New(tempFilePath)
		if err != nil {
			fmt.Println("Error loading PDF:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
			return
		}
		defer doc.Close()

		var wg sync.WaitGroup
		wg.Add(doc.NumPage())

		sem := make(chan struct{}, maxConcurrency) // セマフォアの作成

		for n := 0; n < doc.NumPage(); n++ {
			go func(page int) {
				sem <- struct{}{} // セマフォアを取得
				defer func() {
					<-sem // セマフォアを解放
					wg.Done()
				}()
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

		os.Remove(tempFilePath)
		if strings.ToLower(filepath.Ext(tempFilePath)) == ".pdf" {
			os.Remove(strings.TrimSuffix(tempFilePath, filepath.Ext(tempFilePath)) + ".pptx")
		}
	})

	fmt.Println("Server started on port 8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
