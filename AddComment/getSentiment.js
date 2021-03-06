var settings = require('./settings');
var request = require('request');

module.exports = function getSentiment(context, comment) {

    // Always resolve - don't want to fail everything
    // if we can't get the sentiment
    return new Promise((resolve) => {

        const endpoint = settings().TEXT_ANALYTICS_URL;
        const key = settings().TEXT_ANALYTICS_KEY;

        if (endpoint && key) {
            // Header includes the cognitive services API key
            const headers = {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": key
            };
            const payload = {
                "documents": [
                    {
                        "language": "en",
                        "id": "1",
                        "text": comment
                    }
                ]
            };

            // Make the call to cognitive services
            request.post(endpoint + "/sentiment", {
                'headers': headers,
                'body': JSON.stringify(payload)
            }, (error, response, body) => {
                if (!error && response && response.statusCode == 200) {

                    // If here we got a successful response
                    // Get the sentiment number and translate to
                    // text we can use in the comment
                    const result = JSON.parse(response.body);
                    if (result.documents[0]) {
                        const score = result.documents[0].score;
                        if (score < 0.25) {
                            resolve("feeling unhappy");
                        } else if (score > 0.75) {
                            resolve("feeling happy");
                        } else {
                            resolve("feeling neutral");
                        }
                    } else {
                        // Something went wrong - just leave it unknown
                        resolve("sentiment unknown");
                    }
                } else {
                    // Something went wrong - just leave it unknown
                    reject("sentiment unknown");
                }
            });
        } else {
            // Something went wrong - just leave it unknown
            resolve("sentiment unknown");
        }
    });
}