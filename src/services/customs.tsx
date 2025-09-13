export  function extractDriveFileId(url) {
    // Try to match /d/<id>/ pattern
    const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match1 && match1[1]) return match1[1];

    // Try to match id=<id> pattern
    const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match2 && match2[1]) return match2[1];

    // No ID found
    return null;
  }