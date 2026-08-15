using src.Utils;
using static src.DTO.ProductDTO;

namespace src.Services.product
{
    public interface IProductService
    {
        //create product
        Task<GetProductDto> CreateProductAsync(CreateProductDto createProductDto);

        //get all products
        Task<List<GetProductDto>> GetAllProductsAsync();
        //get products count
        Task<int> CountProductsAsync();

        //get all products in specific subcategory
        Task<List<GetProductDto>> GetProductsBySubCategoryIdAsync(Guid subCategoryId);

        //get all products by using the search by name & pagination
        Task<List<GetProductDto>> GetAllBySearchAsync(PaginationOptions paginationOptions);

        //get all products by using filter feature
        Task<List<GetProductDto>> GetAllByFilterationAsync(FilterationOptions productf);

        //get all products by using sort feature
        Task<List<GetProductDto>> GetAllBySortAsync(SortOptions sortOption);

        //get all products by using the search by name & pagination & filer & sort
        Task<List<GetProductDto>> GetAllAsync(SearchProcess to_search,Guid? SubCategoryId=null);

        //get product by id
        Task<GetProductDto> GetProductByIdAsync(Guid id);

        //update product info
        Task<GetProductDto> UpdateProductInfoAsync(Guid id, UpdateProductInfoDto product);

        //delete product by id
        Task<bool> DeleteProductByIdAsync(Guid id);
    }
}
