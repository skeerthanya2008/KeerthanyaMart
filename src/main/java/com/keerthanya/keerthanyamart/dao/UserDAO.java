package com.keerthanya.keerthanyamart.dao;

import com.keerthanya.keerthanyamart.exception.DataAccessException;
import com.keerthanya.keerthanyamart.model.User;

import java.util.Optional;

public interface UserDAO {
    User insert(User user) throws DataAccessException;
    Optional<User> findById(long id) throws DataAccessException;
    Optional<User> findByEmail(String email) throws DataAccessException;
    java.util.List<User> findAll() throws DataAccessException;
}
