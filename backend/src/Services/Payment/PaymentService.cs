 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using src.Repository;
using src.Database;
using src.Entity;


using static src.DTO.PaymentDTO;
using Microsoft.AspNetCore.Http.HttpResults;
using src.Utils;

namespace src.Services.Payment
{
    public class PaymentService : IPaymentService
    {
        protected readonly PaymentRepository _paymentRepo;
        protected readonly IMapper _mapper;
        public PaymentService (PaymentRepository paymentRepo, IMapper mapper)
        {
            _paymentRepo = paymentRepo;
            _mapper = mapper;
        }

        // Create a payment
        public async Task <PaymentReadDto> CreateOneAsync(PaymentCreateDto createDto)
        {
            Cart cart = await _paymentRepo.GetCart(createDto.CartId);
            if (cart == null)
            {
                // the exception used to be built and dropped, so a missing cart
                // fell through to cart.TotalPrice below and answered with a 500
                throw CustomException.NotFound("Cart not found.");
            }

            if (createDto.CouponId != null) 
            {
                src.Entity.Coupon coupon = await _paymentRepo.GetCoupon(createDto.CouponId);
                if (coupon != null && coupon.IsActive)
                {
                    // cart.TotalPrice already carries any product sale, because the cart
                    // line captured the discounted UnitPrice. So a coupon stacks on top
                    // of a sale, applied to the already-discounted total.
                    //
                    // This used to read cart.TotalPrice * (1 - coupon.DiscountPercentage),
                    // treating a whole percent as a fraction: a 20% coupon produced
                    // total * -19. ApplyPercentage is the one place that decides what a
                    // percentage means, and it clamps to 0-100.
                    createDto.TotalPrice = PricingUtils.ApplyPercentage(cart.TotalPrice, coupon.DiscountPercentage);
                }
                else
                {
                    createDto.TotalPrice = cart.TotalPrice; // update total price without coupon if (coupon == null) or (coupon.IsActive = fales}
                }
            }
            else
            {
                createDto.TotalPrice = cart.TotalPrice; // update total price without coupon 
            }
            var payment = _mapper.Map<PaymentCreateDto, src.Entity.Payment>(createDto);
            var paymentCreated = await _paymentRepo.CreateOneAsync(payment);
            return _mapper.Map<src.Entity.Payment,PaymentReadDto>(paymentCreated);
        }

        // Get all payments
        public async Task<List<PaymentReadDto>> GetAllAsync()
        {
            var paymentList= await _paymentRepo.GetAllAsync();
            return _mapper.Map<List<src.Entity.Payment>, List<PaymentReadDto>>(paymentList);
        }

        // Get a payment by id 
        public async Task<PaymentReadDto> GetByIdAsync(Guid paymentId)
        {
            var foundPayment = await _paymentRepo.GetByIdAsync(paymentId);
            if (foundPayment is null)
            {
                throw CustomException.NotFound($"Payment with id {paymentId} not found");
            }

            return _mapper.Map<src.Entity.Payment, PaymentReadDto> (foundPayment);
        }

        // Update a payment
        public async Task<bool> UpdateOneAsync(Guid paymentId, PaymentUpdateDto updateDto)
        {
            Cart cart = await _paymentRepo.GetCart(updateDto.CartId);
            if (cart == null)
            {
                throw CustomException.NotFound("Cart not found.");
            }

            var foundPayment = await _paymentRepo.GetByIdAsync(paymentId);
            if (foundPayment is null)
            {
                throw CustomException.NotFound("Payment not found");
            }
            
            if (updateDto.CouponId != null) 
            {
                src.Entity.Coupon coupon = await _paymentRepo.GetCoupon(updateDto.CouponId);
                if (coupon != null && coupon.IsActive)
                {
                    // same stacking and same clamp as the create path above
                    updateDto.TotalPrice = PricingUtils.ApplyPercentage(cart.TotalPrice, coupon.DiscountPercentage);
                }
                else
                {
                    updateDto.TotalPrice = cart.TotalPrice; // update total price without coupon if (coupon == null) or (coupon.IsActive = fales}
                }
            }
            else
            {
                updateDto.TotalPrice = cart.TotalPrice; // update total price without coupon 
            }
            _mapper.Map(updateDto, foundPayment);
            var isUpdated = await _paymentRepo.UpdateOneAsync(foundPayment);
            return isUpdated;
        }

        // Delete a payment by id
        public async Task<bool> DeleteOneAsync(Guid paymentId)
        {
            var foundPayment = await _paymentRepo.GetByIdAsync(paymentId);
            if (foundPayment is null)
            {
                throw CustomException.NotFound($"Payment with id {paymentId} not found");
            }

            return await _paymentRepo.DeleteOneAsync(foundPayment);
        }
    }
}

