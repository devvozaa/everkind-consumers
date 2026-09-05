/**
 * EVERKIND CONSUMERS - GOOGLE APPS SCRIPT BACKEND
 * 
 * Instructions for setup:
 * 1. Open your Google Sheet where you want to collect leads.
 * 2. Click Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this entire file.
 * 4. Click Deploy > New deployment.
 * 5. Select type: "Web app".
 * 6. Set Description: "Everkind Form API".
 * 7. Set Execute as: "Me".
 * 8. Set Who has access: "Anyone".
 * 9. Click Deploy, authorize permissions, and copy the Web App URL!
 */

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

    // 1. Save Resume PDF to Google Drive
    var fileUrl = "";
    if (base64Data) {
      // Strip data URL prefix if present
      if (base64Data.indexOf(",") !== -1) {
        base64Data = base64Data.split(",")[1];
      }

      var decodedBlob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        data.mimeType || "application/pdf",
        filename
      );

      var file = DriveApp.createFile(decodedBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }

    // 2. Append Row to Active Google Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
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
