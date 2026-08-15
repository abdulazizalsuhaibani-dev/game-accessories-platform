
 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using src.Repository;
using src.Database;
using src.Entity;
using static src.DTO.CouponDTO;
using src.Utils;

namespace src.Services.Coupon
{
    public class CouponService: ICouponService
    {
        protected readonly CouponRepository _couponRepo;
        protected readonly IMapper _mapper;
        public CouponService (CouponRepository couponRepo, IMapper mapper)
        {
            _couponRepo = couponRepo;
            _mapper = mapper;
        }

        // Create a coupon
        public async Task <CouponReadDto> CreateOneAsync(CouponCreateDto createDto)
        {
            var coupon = _mapper.Map<CouponCreateDto,src.Entity.Coupon>(createDto);
            var couponCreated = await _couponRepo.CreateOneAsync(coupon);
            return _mapper.Map<src.Entity.Coupon,CouponReadDto>(couponCreated);
        }

        // Get all coupons
        public async Task<List<CouponReadDto>> GetAllAsync()
        {
            var couponList = await _couponRepo.GetAllAsync();
            return _mapper.Map<List<src.Entity.Coupon>, List<CouponReadDto>>(couponList);
        }

        // Get a coupon by id
        public async Task<CouponReadDto> GetByIdAsync(Guid id)
        {
            var foundCoupon = await _couponRepo.GetByIdAsync(id);
            return _mapper.Map<src.Entity.Coupon, CouponReadDto> (foundCoupon);       
        }

        // Update a coupon by id
        public async Task<bool> UpdateOneAsync(Guid id, CouponUpdateDto updateDto)
        {
            var foundCoupon = await _couponRepo.GetByIdAsync(id);
            if (foundCoupon == null)
            {
                throw CustomException.NotFound($"Coupon with Id: {id} is not found");
            }
            _mapper.Map(updateDto, foundCoupon);
            return await _couponRepo.UpdateOneAsync(foundCoupon);
        }

        // Delete a coupon by id
        public async Task<bool> DeleteOneAsync(Guid id)
        {
            var foundCoupon = await _couponRepo.GetByIdAsync(id);
            if (foundCoupon== null)
            {
                throw CustomException.NotFound($"Coupon with Id: {id} is not found");
            }
            return await _couponRepo.DeleteOneAsync(foundCoupon); 
        }
    }
}