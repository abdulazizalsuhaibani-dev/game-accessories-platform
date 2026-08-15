using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using src.Entity;
using static src.DTO.CategoryDTO;
using static src.DTO.PaymentDTO;
using static src.DTO.ProductDTO;
using static src.DTO.UserDTO;
using static src.DTO.OrderDTO;
using static src.DTO.CartDTO;
using static src.DTO.SubCategoryDTO;
using Microsoft.Extensions.Options;
using static src.DTO.ReviewDTO;
using static src.DTO.CouponDTO;

namespace src.Utils
{
    public class MapperProfile : Profile
    {
        // user
        public MapperProfile()
        {
            // User mappings
            CreateMap<User, UserReadDto>();
            CreateMap<UserCreateDto, User>();
            CreateMap<User, UserReadUsernameDto>();
            CreateMap<UserUpdateDto, User>()
                .ForAllMembers(opts =>
                    opts.Condition((src, dest, srcProperty) => srcProperty != null)
                );

            // Product Mapping
            CreateMap<Product, GetProductDto>();
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductInfoDto, Product>()
                // CreateMap<UpdateProdouctDescDto, Product>()
                .ForAllMembers(opts =>
                    opts.Condition((src, dest, srcProperty) => srcProperty != null)
                );

            // Category mappings
            CreateMap<Category, CategoryReadDto>();
            CreateMap<CategoryCreateDto, Category>();
            CreateMap<CategoryUpdateDto, Category>()
                .ForAllMembers(options =>
                    options.Condition((src, dest, srcProperty) => srcProperty != null)
                );

            // Subcategory mappings
            CreateMap<SubCategory, SubCategoryReadDto>();
            CreateMap<SubCategoryCreateDto, SubCategory>();
            CreateMap<SubCategoryUpdateDto, SubCategory>()
                .ForAllMembers(options =>
                    options.Condition((src, dest, srcProperty) => srcProperty != null)
                );

            // Payment mappings
            CreateMap<Payment, PaymentReadDto>();
            CreateMap<PaymentCreateDto, Payment>();
            CreateMap<PaymentUpdateDto, Payment>()
                .ForAllMembers(options =>
                    options.Condition((src, dest, srcProperty) => srcProperty != null)
                );

            // Order mappings
            CreateMap<Order, OrderReadDTO>();
            CreateMap<OrderCreateDTO, Order>();
            CreateMap<OrderReadDTO, Order>();
            CreateMap<OrderUpdateDTO, Order>()
                .ForAllMembers(opts =>
                    opts.Condition((src, dest, srcProperty) => srcProperty != null)
                );

            // Cart mappings
            CreateMap<Cart, CartReadDto>();
            CreateMap<CartCreateDto, Cart>();
            CreateMap<CartUpdateDto, Cart>()
                .ForAllMembers(options =>
                    options.Condition((src, dest, srcProperty) => srcProperty != null)
                );
            CreateMap<CartDetailsDto, CartDetails>()
                .ForAllMembers(options =>
                    options.Condition((src, dest, srcProperty) => srcProperty != null)
                );

            //Review mappings
            CreateMap<Review, ReadReviewDto>();
            CreateMap<CreateReviewDto, Review>();
            CreateMap<UpdateReviewDto, Review>()
            .ForAllMembers(options =>
                options.Condition((src, dest, srcProperty) => srcProperty != null)
            );

            //Coupon mappings
            CreateMap<Coupon, CouponReadDto>();
            CreateMap<CouponCreateDto, Coupon>();
            CreateMap<CouponUpdateDto, Coupon>()
            .ForAllMembers(options =>
                options.Condition((src, dest, srcProperty) => srcProperty != null)
            );

        }
    }
}
