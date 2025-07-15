package com.example.demo.controller;
import com.example.demo.model.User;
import com.example.demo.model.UserProfile;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;

import java.util.Optional;
import java.util.Map;



@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user){
        try{
            System.out.println(user);
            User createduser = userService.signup(user);
            return ResponseEntity.ok(createduser);
        }catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username,@RequestParam String password){
        Optional<User> userOpt = userService.login(username, password);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestParam String username, @RequestParam String newPassword) {
        try {
            User updatedUser = userService.updatePassword(username, newPassword);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public String deleteUser(@RequestParam String username) {
        userService.deleteUserByUsername(username);
        return "User deleted successfully";
    }

    @PostMapping("/update-password-verification")
    public ResponseEntity<?> updatePasswordVerification(@RequestParam String username) {
    try {
        int code = userService.sendPasswordResetCode(username);
        return ResponseEntity.ok(code); 
    } catch (RuntimeException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
    }

    @PostMapping("/save-profile")
    public ResponseEntity<String> saveProfile(@RequestBody UserProfile profile) {
        try {
            userService.saveOrUpdateProfile(profile);
            return ResponseEntity.ok("Profile saved successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save profile");
        }
    }

    @GetMapping("/get-profile")
    public ResponseEntity<?> getProfile(@RequestParam String username){
        try{
            return userService.getProfile(username);
        }catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to Get Profile");
        }
    }

    @PostMapping("/download-resume")
    public ResponseEntity<Resource> downloadResume(@RequestBody String username) {
        return userService.downloadResume(username);
    }



    @PostMapping(value = "/upload-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadResume(@RequestParam("resume") MultipartFile resume,
                                               @RequestParam("username") String username) {
        try {
            userService.saveResume(resume, username);
            return ResponseEntity.ok("Resume uploaded and profile updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload resume");
        }
    }


}
