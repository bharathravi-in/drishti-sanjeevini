# 📸 Photo Management Guide - DRiSHTi SANjEEViNi

## 🎯 Overview
This guide covers how to manage your profile photo and cover photo on DRiSHTi SANjEEViNi, including uploading, positioning, and removing photos for optimal display.

---

## 🖼️ Profile Photo Management

### ✅ **How to Upload a New Profile Photo**

1. **Navigate to Your Profile**
   - Click on your profile avatar in the top-right corner
   - Select "Profile" from the dropdown menu

2. **Enter Edit Mode**
   - Click the "Edit Profile" button in the top-right of your profile page
   - The interface will switch to editing mode with green highlights

3. **Upload Your Photo**
   - Look for the circular profile photo area (top-left of the profile section)
   - Click the camera icon (📷) button at the bottom-right of the profile circle
   - Select an image file from your device
   - Wait for the upload to complete (you'll see a loading spinner)

4. **Automatic Processing**
   - The photo will be automatically resized and positioned
   - A success message will appear: "Profile photo updated!"
   - The new photo appears immediately in the circular frame

### ❌ **How to Remove Your Current Profile Photo**

1. **Enter Edit Mode** (follow steps 1-2 above)
2. **Access Remove Option**
   - Click the camera icon on your current profile photo
   - Click the "Remove" button that appears below the photo
3. **Confirm Removal**
   - The photo will be removed immediately
   - Your profile will show the default avatar (your initials)
   - Success message: "Profile photo removed"

---

## 🌄 Cover Photo Management

### ✅ **How to Upload a New Cover Photo**

1. **Navigate to Profile & Edit Mode** (follow Profile Photo steps 1-2)

2. **Upload Cover Photo**
   - Look for the large rectangular area at the top of your profile
   - Hover over the cover photo area to reveal the upload button
   - Click "Upload Cover" or "Change Cover" button
   - Select an image file from your device
   - Wait for upload completion

3. **Automatic Positioning**
   - The cover photo will be automatically fitted to the 16:3 aspect ratio
   - The image will be centered and cropped if necessary
   - Success message: "Cover photo updated!"

### ❌ **How to Remove Your Current Cover Photo**

1. **Enter Edit Mode** (follow Profile Photo steps 1-2)
2. **Access Remove Option**
   - Hover over your current cover photo
   - Click the "Remove" button in the top-right corner of the cover area
3. **Confirm Removal**
   - The cover photo will be removed immediately
   - The area will show the default gradient background
   - Success message: "Cover photo removed"

---

## 📐 **Recommended Image Specifications**

### 🔵 **Profile Photo Requirements**
- **Dimensions**: 400x400 pixels (minimum)
- **Aspect Ratio**: 1:1 (square)
- **File Formats**: JPG, JPEG, PNG
- **Maximum Size**: 2MB
- **Display Size**: 96x96 pixels (circular crop)
- **Recommended**: High-resolution headshot, well-lit, clear face

### 🟢 **Cover Photo Requirements**
- **Dimensions**: 1200x400 pixels (recommended)
- **Aspect Ratio**: 3:1 (wide rectangle)
- **File Formats**: JPG, JPEG, PNG
- **Maximum Size**: 5MB
- **Display Size**: Full width × 192px height
- **Recommended**: Landscape orientation, avoid important content at edges

---

## 🎨 **Optimal Display Guidelines**

### 📱 **Profile Photo Best Practices**
- **Composition**: Center your face in the frame
- **Background**: Use solid colors or simple backgrounds
- **Lighting**: Ensure good, even lighting on your face
- **Expression**: Use a friendly, approachable expression
- **Quality**: Use high-resolution images for crisp display
- **Professional**: Keep it appropriate for community interaction

### 🖼️ **Cover Photo Best Practices**
- **Safe Zone**: Keep important content in the center 80% of the image
- **Text Overlay**: Avoid text that might be covered by profile elements
- **Color Harmony**: Choose colors that complement your profile photo
- **Content**: Use images that represent your interests or personality
- **Contrast**: Ensure good contrast for readability of overlaid text

---

## 🔧 **Technical Details**

### 📤 **Upload Process**
1. **File Validation**: System checks file type and size
2. **Preview Generation**: Temporary preview shown during upload
3. **Storage**: Files uploaded to Supabase Storage bucket `profile-assets`
4. **URL Generation**: Public URL created for the uploaded image
5. **Database Update**: User profile updated with new photo URL
6. **Cache Refresh**: Browser cache updated to show new image

### 🗂️ **File Organization**
```
profile-assets/
├── {user_auth_id}/
│   ├── avatar.jpg (profile photo)
│   └── cover.jpg (cover photo)
```

### 🔒 **Security & Privacy**
- **Access Control**: Only you can upload/modify your photos
- **Public Visibility**: Photos are publicly viewable once uploaded
- **Automatic Cleanup**: Old photos are replaced when new ones are uploaded
- **Data Protection**: Files stored securely in Supabase Storage

---

## 📱 **Mobile Optimization**

### 📲 **Mobile Upload Experience**
- **Touch-Friendly**: Large, easy-to-tap upload buttons
- **Camera Integration**: Direct camera access on mobile devices
- **Responsive Design**: Optimized layout for all screen sizes
- **Progress Indicators**: Clear upload progress and status messages

### 🔄 **Responsive Display**
- **Profile Photo**: Maintains circular shape across all devices
- **Cover Photo**: Scales proportionally on different screen sizes
- **Layout Adaptation**: Profile elements reposition for mobile viewing

---

## ⚠️ **Troubleshooting**

### 🚫 **Common Upload Issues**

**"File too large" Error**
- **Solution**: Compress your image or choose a smaller file
- **Tools**: Use online image compressors or photo editing apps

**"Invalid file type" Error**
- **Solution**: Convert your image to JPG or PNG format
- **Supported**: .jpg, .jpeg, .png files only

**Upload Stuck/Failed**
- **Solution**: Check your internet connection and try again
- **Alternative**: Refresh the page and attempt upload again

**Photo Not Displaying**
- **Solution**: Clear your browser cache and refresh
- **Wait Time**: Allow a few seconds for the image to load

### 🔄 **Browser Compatibility**
- **Supported**: Chrome, Firefox, Safari, Edge (latest versions)
- **JavaScript**: Must be enabled for upload functionality
- **Cookies**: Required for authentication during upload

---

## 💡 **Pro Tips**

### ✨ **Photo Quality Tips**
1. **Use Natural Light**: Take photos near a window for best lighting
2. **High Resolution**: Start with high-quality images for best results
3. **Consistent Style**: Match your profile and cover photo aesthetically
4. **Regular Updates**: Keep photos current and relevant
5. **Test on Mobile**: Check how your photos look on different devices

### 🎯 **Community Guidelines**
- **Appropriate Content**: Use family-friendly, community-appropriate images
- **Personal Photos**: Use your own photos or images you have rights to use
- **Clear Identity**: Profile photos should clearly show your face
- **Professional Appearance**: Maintain a respectful, professional image

---

## 📞 **Support**

If you encounter issues with photo uploads or have questions about image requirements, please:

1. **Check this guide** for common solutions
2. **Clear browser cache** and try again
3. **Contact support** through the app's help section
4. **Report bugs** via the feedback form

---

*Last updated: December 2024*
*Platform: DRiSHTi SANjEEViNi - Building Communities That Care*