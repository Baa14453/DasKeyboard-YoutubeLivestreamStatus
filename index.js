const q = require('daskeyboard-applet');
const {google} = require('googleapis')
const logger = q.logger;

class StreamerStatus extends q.DesktopApp {

  constructor() {
    super();
    // run every 10 min
    this.pollingInterval = 10000;
  }

  // function to search youtube for active livestreams
  async getStreamStatus(channelID, youtube) {
 
    const res = await youtube.search.list({
      part: 'snippet',
      "channelId": channelID,
      "eventType": "live",
      "type": [
        "video"
      ]
    });
    return (res);
  }

  generateSignal(streamStatus, onlineColour, offlineColour) {

    // If stream is live/if there are any results.
    if (streamStatus.data.items[0]) {
      return new q.Signal({
        points: [
          [new q.Point(onlineColour)]
        ],
        link: {
          url: `https://www.youtube.com/watch?v=${streamStatus.data.items[0]['id'].videoId}`,
          label: 'This channel is streaming!',
        },
        name: "This channel is streaming!",
        message: "This channel is streaming!"
      });
    } else {
      
    // If stream is offline/if there are no results
    return new q.Signal({
      points: [
        [new q.Point(offlineColour)]
      ],
      link: {
      },
      name: "This channel is offline!",
      message: "This channel is offline!"
    });
  }};


  async run() {
    logger.info("Stream check running.");

    const onlineColour = this.config.onlineColour;
    const offlineColour = this.config.offlineColour;
    const channelID = this.config.channelID;

    const youtube = google.youtube({
      version: 'v3',
      auth: this.authorization.apiKey,
    })

    if (channelID) {
      logger.info("My channel ID is: " + channelID);
      return this.getStreamStatus(channelID, youtube).then(streamStatus => {
        return this.generateSignal(streamStatus, onlineColour, offlineColour);
      }).catch((error) => {
        logger.error("Error while getting stream status: " + error);
        if(`${error.message}`.includes("getaddrinfo")){
        }else{
          return q.Signal.error([`The Youtube API returned an error. Detail: ${error}`]);
        }
      });
    } else {
      logger.info("No channel ID configured.");
      return null;
    }
  }

}


module.exports = {
  StreamerStatus: StreamerStatus
};

const applet = new StreamerStatus();
