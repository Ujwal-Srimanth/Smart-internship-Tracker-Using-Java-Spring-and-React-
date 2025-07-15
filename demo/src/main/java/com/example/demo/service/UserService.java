package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.User;
import com.example.demo.model.UserProfile;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserProfileRepository;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.Random;

import java.nio.file.Path;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.File;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private final String resumeDir = "uploads/resumes";

    public ResponseEntity<Resource> downloadResume(String username) {
        Optional<UserProfile> optionalProfile = userProfileRepository.findByUsername(username);

        if (optionalProfile.isEmpty() || optionalProfile.get().getResumeFileName() == null) {
            return ResponseEntity.status(404).build();
        }

        String resumeFileName = optionalProfile.get().getResumeFileName();
        Path filePath = Paths.get(resumeDir).resolve(resumeFileName).normalize();

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.status(404).build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF) // adjust if needed
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    public User signup(User user){
        if(userRepository.findByUsername(user.getUsername()).isPresent()){
            throw new RuntimeException("User Name Already Taken");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> login(String username,String password)
    {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if(userOpt.isPresent()){
            User user = userOpt.get();
            if(passwordEncoder.matches(password,user.getPassword())){
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public User updatePassword(String username,String password){
        Optional<User> userOpt = userRepository.findByUsername(username);
        if(userOpt.isEmpty()){
            throw new RuntimeException("User Doesnot Exist");
        }
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    public void saveOrUpdateProfile(UserProfile profile) {
    // Optional: check if already exists and update instead
    userProfileRepository.save(profile);
    }
    
    public ResponseEntity<?> getProfile(String username) {
        Optional<UserProfile> optionalProfile = userProfileRepository.findByUsername(username);
        if (optionalProfile.isPresent()) {
            UserProfile profile = optionalProfile.get();
            return ResponseEntity.ok(profile);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found");
        }
    }

    
    public void saveResume(MultipartFile resume, String username) throws IOException {
        String fileName = username + "_" + resume.getOriginalFilename();
    
        // This will save in the project root directory under /resumes
        String uploadDir = new File(".").getCanonicalPath() + File.separator + "resumes";
    
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
    
        File dest = new File(uploadDir + File.separator + fileName);
        resume.transferTo(dest);
    
        // Update resume path in DB
        Optional<UserProfile> optionalProfile = userProfileRepository.findByUsername(username);
        if (optionalProfile.isPresent()) {
            UserProfile profile = optionalProfile.get();
            profile.setResumeFileName(fileName);
            userProfileRepository.save(profile);
        } else {
            throw new RuntimeException("User profile not found for username: " + username);
        }
    }

    
    


    public void deleteUserByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            userRepository.delete(user);
        }
    }

    public int sendPasswordResetCode(String username) {
    Optional<User> userOpt = userRepository.findByUsername(username);
    if (userOpt.isEmpty()) {
        throw new RuntimeException("User not found");
    }


    User user = userOpt.get();
    System.out.println(user);
    String email = user.getEmail();
    System.out.println(email);

    int code = new Random().nextInt(900000) + 100000; // 6-digit random code

    // Send email
    emailService.sendEmail(email, "Password Reset Verification Code",
            "Your verification code is: " + code);

    return code;
}
    


}
