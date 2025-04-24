import { MediaControlClient } from '../lib/mediaControl';

// In your app initialization
if (!process.env.MEDIA_CONTROL_SECRET) {
  throw new Error('MEDIA_CONTROL_SECRET is not set');
}
const mediaControl = new MediaControlClient(process.env.MEDIA_CONTROL_SECRET);

const connectMediaControl = (userToken: string) => {
  mediaControl.connect(userToken);
};

const disconnectMediaControl = () => {
  mediaControl.disconnect();
};
