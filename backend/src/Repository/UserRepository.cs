using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using src.Database;
using src.Entity;

namespace src.Repository
{
    public class UserRepository
    {
        // user table
        protected DbSet<User> _user;
        protected DatabaseContext _databaseContext;
        public UserRepository(DatabaseContext databaseContext)
        {
            _databaseContext = databaseContext;
            _user = databaseContext.Set<User>();
        }
        public async Task<User> CreateOneAsync(User newUser)
        {
            await _user.AddAsync(newUser);
            await _databaseContext.SaveChangesAsync();
            return newUser;
        }
        public async Task<List<User>> GetAllAsync()
        {   
            return await _user.ToListAsync();
        }
        public async Task<User> GetByIdAsync(Guid id)
        {
            return await _user.FindAsync(id);
        }
        public async Task<bool> DeleteOneAsync(User user)
        {
            _user.Remove(user);
            await _databaseContext.SaveChangesAsync();
            return true;
        }
        public async Task<bool> UpdateOneAsync(User updateUser)
        {
            _user.Update(updateUser);
            await _databaseContext.SaveChangesAsync();
            return true;
        }
        // Emails are stored lower-cased so the unique index actually catches
        // "Ada@example.com" and "ada@example.com" as the same account.
        public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

        // find user by email
        public async Task<User> FindByEmailAsync(string email)
        {
            var normalized = NormalizeEmail(email);
            return await _user.FirstOrDefaultAsync(u => u.Email == normalized);
        }

        // Existence checks are a targeted query, never a full-table scan: registration
        // used to load every user row into memory to compare three fields.
        public async Task<bool> EmailExistsAsync(string email, Guid? exceptUserId = null)
        {
            var normalized = NormalizeEmail(email);
            return await _user.AnyAsync(u =>
                u.Email == normalized && (exceptUserId == null || u.UserId != exceptUserId));
        }

        public async Task<bool> PhoneExistsAsync(string phoneNumber, Guid? exceptUserId = null)
        {
            return await _user.AnyAsync(u =>
                u.PhoneNumber == phoneNumber && (exceptUserId == null || u.UserId != exceptUserId));
        }

        public async Task<bool> UsernameExistsAsync(string username, Guid? exceptUserId = null)
        {
            return await _user.AnyAsync(u =>
                u.Username == username && (exceptUserId == null || u.UserId != exceptUserId));
        }
    }
}
