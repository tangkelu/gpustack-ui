import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import WaveSurfer, { WaveSurferOptions } from 'wavesurfer.js';

interface AudioPlayerProps {
  autoplay: boolean;
  audioUrl: string;
  speed: number;
  ref?: any;
  height?: number;
  width?: number;
  onReady?: () => void;
  onClick?: (value: number) => void;
  onFinish?: () => void;
  onAnalyse?: (analyseData: any, frequencyBinCount: any) => void;
}

const AudioPlayer: React.FC<
  AudioPlayerProps & Omit<WaveSurferOptions, 'container'>
> = forwardRef((props, ref) => {
  const { autoplay, audioUrl, speed = 1, ...rest } = props;
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const container = useRef<any>(null);
  const audioContext = useRef<any>(null);
  const analyser = useRef<any>(null);
  const dataArray = useRef<any>(null);
  const audioStream = useRef<any>(null);
  const mediaElement = useRef<any>(null);

  const initAudioContext = useCallback(() => {
    audioContext.current = new (window.AudioContext ||
      window.webkitAudioContext)();

    analyser.current = audioContext.current.createAnalyser();
    analyser.current.fftSize = 512;
    dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);
  }, []);

  const generateVisualData = useCallback(() => {
    const source = audioContext.current.createMediaElementSource(
      mediaElement.current
    );
    source.connect(analyser.current);
    analyser.current.connect(audioContext.current.destination);
  }, []);

  const listenEvents = () => {
    wavesurfer.current?.on('ready', () => {
      props.onReady?.();
    });

    wavesurfer.current?.on('click', (value) => {
      props.onClick?.(value);
    });
    wavesurfer.current?.on('finish', () => {
      props.onFinish?.();
    });
    wavesurfer.current?.on('play', () => {
      // analyser.current?.getByteFrequencyData(dataArray.current);
      // props.onAnalyse?.(dataArray.current, analyser);
    });
  };

  const createWavesurfer = () => {
    wavesurfer.current = WaveSurfer.create({
      container: container.current,
      url: audioUrl,
      autoplay: autoplay,
      audioRate: speed,
      waveColor: '#4096ff',
      progressColor: 'rgb(100, 0, 100)',
      height: 60,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      interact: true,
      cursorWidth: 0,
      ...rest
    });

    mediaElement.current = wavesurfer.current?.getMediaElement();

    initAudioContext();
    generateVisualData();
    listenEvents();
  };

  const destroyWavesurfer = () => {
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }
  };

  const play = () => {
    if (wavesurfer.current) {
      wavesurfer.current.play();
    }
  };

  const duration = () => {
    if (wavesurfer.current) {
      return wavesurfer.current.getDuration();
    }
    return 0;
  };

  const pause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.pause();
    }
  };

  useImperativeHandle(ref, () => {
    return {
      play,
      pause,
      duration
    };
  });

  useEffect(() => {
    if (container.current && audioUrl) {
      createWavesurfer();
    }
    return () => {
      destroyWavesurfer();
    };
  }, [audioUrl, container.current]);
  return <div ref={container} className="audio-container"></div>;
});

export default React.memo(AudioPlayer);
