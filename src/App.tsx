import React, { useState } from "react";
import "./App.css";
import { Button, Modal, Progress } from "antd";
import { useVideoGenerator } from "./utils";

function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoLoad, setVideoLoad] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const { loadAllImage, generateVideo } = useVideoGenerator({
    onStart: () => setModalVisible(true),
    onProgress: (progress: number) => setProgress(progress),
    onEnd: (videoUrl) => {
      setModalVisible(false);
      setVideoLoad(true)
      setVideoUrl(videoUrl)
    },
  });
  const handleGenerate = () => {
    loadAllImage().then(() => {
      generateVideo();
    });
  };

  const downloadVideo = () => {
       // 创建一个链接
       const downloadLink = document.createElement('a');
       downloadLink.href = videoUrl;

       // 设置链接的下载属性为视频文件名
       downloadLink.download = 'downloaded_video.mp4'; // 修改为你想要的文件名

       // 触发链接的点击事件
       downloadLink.click();
  }
  return (
    <div className="App">
      <div className="btn-container">
      <Button type="primary" onClick={handleGenerate} style={{display: 'block'}}>
        {" "}
        click me to generate a video
      </Button>
      {videoLoad && <Button type="primary" onClick={downloadVideo} style={{display: 'block'}}> click me to downloadVideo</Button>}
      </div>

      <Modal open={modalVisible} footer={null} closable={false}>
        <div style={{display: 'flex', justifyContent: 'space-evenly', alignItems: 'center'}}>
        <div>视频生成中....</div>
        <Progress percent={progress} type="circle"></Progress>
        </div>
      </Modal>
    </div>
  );
}

export default App;
