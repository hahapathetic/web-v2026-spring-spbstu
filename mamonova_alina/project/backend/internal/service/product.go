package service

import (
	"gadget_hub.com/internal/model"
	"gadget_hub.com/internal/repository"
)

type ProductService struct {
	ProductRepository repository.ProductRepository
}

func (s *ProductService) GetProducts(filter repository.ProductFilter) ([]model.Product, error) {
	return s.ProductRepository.FindAll(filter)
}

func (s *ProductService) CountProducts(filter repository.ProductFilter) (int, error) {
	return s.ProductRepository.Count(filter)
}

func (s *ProductService) GetProductByID(id int) (*model.Product, error) {
	return s.ProductRepository.FindByID(id)
}
