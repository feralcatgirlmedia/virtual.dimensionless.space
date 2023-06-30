function convertPlaylist() {
    // Get the Traktor playlist file
    var traktorInput = document.getElementById("traktor-input").files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var traktorData = e.target.result;
        // Process the Traktor playlist data and convert it to .m3u format
        var m3uData = traktorToM3U(traktorData);
        // Display the generated .m3u output
        var resultContainer = document.getElementById("result-container");
        resultContainer.innerText = m3uData;
        // Create a download link for the converted .m3u file (with dir contents)
        var downloadLinkM3U = createDownloadLink(m3uData, traktorInput.name.replace(".nml", ".m3u"), "Download .m3u (w/ folder metadata)");
        // Create a download link for the converted .m3u file (without dir contents)
        var m3uDataWithoutDir = traktorToM3U(traktorData, true);
        var downloadLinkM3UWithoutDir = createDownloadLink(m3uDataWithoutDir, traktorInput.name.replace(".nml", ".stripped.m3u"), "Download .m3u (w/o folder metadata)");
        // Create a download link for the track information as a plaintext .txt file
        var trackInfoText = generateTrackInfoText(traktorData);
        var downloadLinkText = createDownloadLink(trackInfoText, traktorInput.name.replace(".nml", ".txt"), "Download .txt");
        // Display the download links
        resultContainer.appendChild(downloadLinkM3U);
        resultContainer.appendChild(downloadLinkM3UWithoutDir);
        resultContainer.appendChild(downloadLinkText);
    };
    reader.readAsText(traktorInput);
}

    function createDownloadLink(data, filename, buttonText) {
        var downloadLink = document.createElement("a");
        downloadLink.href = "data:text/plain;charset=utf-8," + encodeURIComponent(data);
        downloadLink.download = filename;
        downloadLink.innerHTML = '<button>' + buttonText + '</button>';
        return downloadLink;
    }

function traktorToM3U(traktorData, excludeDir) {
    // Split the Traktor data into individual lines
    var lines = traktorData.split("\n");
    // Initialize the .m3u data
    var m3uData = "#EXTM3U\n";
    // Process each line of the Traktor data
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        // Check if the line contains a track entry
if (line.startsWith("<ENTRY") || line.startsWith("<LOCATION") || line.startsWith("<ALBUM") || line.startsWith("<INFO")) {	
            // Extract the track information from the line
            var title = extractValue(line, "TITLE");
            var artist = extractValue(line, "ARTIST");
            var location = extractValue(line, "LOCATION");
            var dir = extractValue(line, "DIR");
            var file = extractValue(line, "FILE");
            var genre = extractValue(line, "GENRE");
            var bpm = extractValue(line, "BPM");
            var playtime = extractPlaytime(lines, i);

            // Extract the file extension from the FILE value
            var fileExtension = getFileExtension(file);

            // Replace HTML entities in track information
            title = replaceHtmlEntities(title);
            artist = replaceHtmlEntities(artist);
            file = replaceHtmlEntities(file);
            dir = replaceHtmlEntities(dir)

            // Add the track information to the .m3u data with file extension and playtime
            if (title !== "" && artist !== "") {
                m3uData += "#EXTINF:" + playtime + "," + artist + " - " + title + "\n";
                if (excludeDir) {
                    m3uData += file + "\n\n";
                } else {
                    m3uData += dir + file + "\n\n";
                }
            }
        }
    }
    return m3uData;
}

    function extractValue(line, key) {
        // Extract the value associated with the specified key from a line
        var regex = new RegExp(key + "=\"(.*?)\"", "i");
        var match = line.match(regex);
        if (match && match.length > 1) {
            return match[1];
        }
        return "";
    }

    function getFileExtension(file) {
        // Extract the file extension from the FILE value
        var fileExtension = file.split(".").pop();
        return fileExtension;
    }

    function extractPlaytime(lines, currentIndex) {
        // Find the line starting with <INFO for the current track entry
        for (var i = currentIndex + 1; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.startsWith("<INFO")) {
                // Extract the PLAYTIME value from the INFO line
                var playtime = extractValue(line, "PLAYTIME");
                return playtime;

            }
        }
        return "";
    }

    function replaceHtmlEntities(str) {
        var entities = {
            "&amp;": "&",
            ":": "",
            // Add more HTML entities here if needed
        };
        for (var entity in entities) {
            if (entities.hasOwnProperty(entity)) {
                str = str.replace(new RegExp(entity, "g"), entities[entity]);
            }
        }
        return str;
    }

function generateTrackInfoText(traktorData) {
    // Split the Traktor data into individual lines
    var lines = traktorData.split("\n");
    // Initialize the track info text
    var trackInfoText = "";
    // Process each line of the Traktor data
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        // Check if the line contains a track entry
if (line.startsWith("<ENTRY") || line.startsWith("<LOCATION") || line.startsWith("<ALBUM") || line.startsWith("<INFO")) {	
            // Extract the track information from the line
            var title = extractValue(line, "TITLE");
            var artist = extractValue(line, "ARTIST");
            var location = extractValue(line, "LOCATION");
            var dir = extractValue(line, "DIR");
            var file = extractValue(line, "FILE");
            var album = extractValue(line, "ALBUM");
            var key = extractValue(line, "KEY");
            var genre = extractValue(line, "GENRE");
            var bpm = extractValue(line, "BPM");
            var playtime = extractPlaytime(lines, i);


            // Replace HTML entities in track information
            title = replaceHtmlEntities(title);
            artist = replaceHtmlEntities(artist);
            album = replaceHtmlEntities(album);
            dir = replaceHtmlEntities(dir);

            // Add the track information to the track info text
            if (title !== "" && artist !== "") {
                trackInfoText += "Title: " + title + "\n";
                trackInfoText += "Artist: " + artist + "\n";
                trackInfoText += "Album: " + album + "\n";
                trackInfoText += "Genre: " + genre + "\n";
                trackInfoText += "Key: " + key + "\n";
                trackInfoText += "BPM: " + bpm + "\n";
                trackInfoText += "Runtime (seconds): " + playtime + "\n";
                trackInfoText += "Filename: " + dir + file + "\n\n";

            }
        }
    }
    return trackInfoText;
}
