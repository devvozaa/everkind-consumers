/**
 * EVERKIND CONSUMERS - GOOGLE APPS SCRIPT BACKEND
 * 
 * Target Folder ID: 10ja_qFzx7sToS7PFZHwNOOVzpOoefCEy
 * Target Spreadsheet ID: 1lSpTKrhcH3JUxupzpbh1JjyEEFZ_EdCNo3fNybCWcHE
 * 
 * CRITICAL STEP TO FIX ACCESS DENIED:
 * 1. Replace all code in Apps Script Editor Code.gs with this entire file.
 * 2. In Apps Script, select function "authorizeAndTest" from the top dropdown menu.
 * 3. Click the "Run" ▶️ button.
 * 4. Click "Review permissions" -> Choose your Google Account -> Click "Advanced" -> Click "Go to Untitled project (unsafe)" -> Click "Allow".
 * 5. Click Deploy > Manage Deployments > Edit (pencil icon) > Version: "New version" > Click Deploy!
 */

var FOLDER_ID = "10ja_qFzx7sToS7PFZHwNOOVzpOoefCEy";
var SPREADSHEET_ID = "1lSpTKrhcH3JUxupzpbh1JjyEEFZ_EdCNo3fNybCWcHE";

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var name = data.name || "Anonymous";
    var email = data.email || "";
    var role = data.role || "General Application";
    var experience = data.experience || "Not Specified";
    var linkedin = data.linkedin || "";
    var filename = data.filename || "Resume.pdf";
    var base64Data = data.base64 || "";

    // 1. Save Resume PDF to Specific Google Drive Folder
    var fileUrl = "";
    if (base64Data) {
      if (base64Data.indexOf(",") !== -1) {
        base64Data = base64Data.split(",")[1];
      }

      var decodedBlob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        data.mimeType || "application/pdf",
        filename
      );

      var folder;
      try {
        folder = DriveApp.getFolderById(FOLDER_ID);
      } catch (fErr) {
        folder = DriveApp.getRootFolder();
      }

      var file = folder.createFile(decodedBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }

    // 2. Append Row to Specific Google Sheet
    var spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (sErr) {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }
    
    var sheet = spreadsheet.getActiveSheet();
    
    // Ensure header row exists if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Email Address",
        "Desired Role",
        "Work Experience",
        "LinkedIn Profile",
        "Resume Drive Link",
        "Resume Filename"
      ]);
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      role,
      experience,
      linkedin,
      fileUrl,
      filename
    ]);

    var response = {
      status: "success",
      result: "success",
      message: "Application submitted successfully",
      fileUrl: fileUrl
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errorResponse = {
      status: "error",
      result: "error",
      message: error.toString()
    };

    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Everkind Applications API is active." }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this function ONCE inside Google Apps Script editor to authorize DriveApp and SpreadsheetApp!
 */
function authorizeAndTest() {
  Logger.log("Testing Drive Access...");
  var folder = DriveApp.getFolderById(FOLDER_ID);
  Logger.log("Folder Name: " + folder.getName());

  Logger.log("Testing Spreadsheet Access...");
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log("Spreadsheet Name: " + sheet.getName());

  Logger.log("Authorization Successful!");
}
