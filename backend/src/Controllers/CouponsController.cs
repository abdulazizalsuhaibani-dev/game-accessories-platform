using Microsoft.AspNetCore.Mvc;
using src.Entity;
using src.Controller;
using src.Services.Payment;
using src.Repository;
using static src.DTO.CouponDTO;
using Microsoft.AspNetCore.Authorization;
using src.Services.Coupon;

namespace src.Controller
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class CouponsController : ControllerBase
    {
        protected readonly ICouponService _couponService;
        public CouponsController(ICouponService service)
        {
            _couponService = service;
        }
        
        // Get all coupons: GET api/v1/coupons
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<CouponReadDto>>> GetAllCoupons()
        {
            var coupon_list = await _couponService.GetAllAsync();
            return Ok(coupon_list);
        }
    
        // Get a coupon by id: GET api/v1/coupons/{id}
        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<CouponReadDto>> GetCouponById(Guid id)
        {
            var coupon = await _couponService.GetByIdAsync(id);
            return Ok(coupon);
        }
    
        // Create a coupon: POST api/v1/coupons
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<CouponReadDto>> CreateCoupon(CouponCreateDto coupon){
            var created_coupon = await _couponService.CreateOneAsync(coupon);
            return Ok(created_coupon);
        }
  
        // Update a coupon by id: PUT api/v1/coupons/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<CouponReadDto>> UpdateCoupon(Guid id, CouponUpdateDto coupon){
            var updated_coupon = await _couponService.UpdateOneAsync(id,coupon);
            return Ok(updated_coupon);
        }

        // Delete a coupon by id: DELETE api/v1/coupons/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOneAsync([FromRoute] Guid id)
        {
            await _couponService.DeleteOneAsync(id);
            return NoContent(); 
        }
    }
}
      