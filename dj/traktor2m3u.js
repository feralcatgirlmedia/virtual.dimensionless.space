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
            // Create a download link for the converted .m3u file
            var downloadLink = document.createElement("a");
            downloadLink.href = "data:text/plain;charset=utf-8," + encodeURIComponent(m3uData);
            downloadLink.download = traktorInput.name.replace(".nml", ".m3u");
            downloadLink.innerHTML = '<button>Download Playlist</button>';
            // Display the download link
            resultContainer.appendChild(downloadLink);
        };
        reader.readAsText(traktorInput);
    }

    function traktorToM3U(traktorData) {
        // Split the Traktor data into individual lines
        var lines = traktorData.split("\n");
        // Initialize the .m3u data
        var m3uData = "#EXTM3U\n";
        // Process each line of the Traktor data
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            // Check if the line contains a track entry
            if (line.startsWith("<ENTRY")) {
                // Extract the track information from the line
                var title = extractValue(line, "TITLE");
                var artist = extractValue(line, "ARTIST");
                var file = extractValue(line, "FILE");
                var playtime = extractPlaytime(lines, i);

                // Extract the file extension from the FILE value
                var fileExtension = getFileExtension(file);

                // Replace HTML entities in track information
                title = replaceHtmlEntities(title);
                artist = replaceHtmlEntities(artist);
                file = replaceHtmlEntities(file);

                // Add the track information to the .m3u data with file extension and playtime
                m3uData += "#EXTINF:" + playtime + "," + artist + " - " + title + "\n";
                m3uData += file + "\n\n";
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
            // Add more HTML entities here if needed
        };
        for (var entity in entities) {
            if (entities.hasOwnProperty(entity)) {
                str = str.replace(new RegExp(entity, "g"), entities[entity]);
            }
        }
        return str;
    }
