package main

import (
	"gadget_hub.com/internal/app"
	"log"
	"net/http"
)

func main() {
	application, err := app.New()
	if err != nil {
		log.Fatalf("failed to initialize app: %v", err)
	}

	srv := &http.Server{
		Addr:    ":" + application.Config.Server.Port,
		Handler: application.Router,
	}

	log.Printf("Server started on port %s", application.Config.Server.Port)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
