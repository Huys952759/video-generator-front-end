import * as StackBlur from "stackblur-canvas";

interface Position {
  left: number;
  top: number;
}
interface GenertorOptions {
  containerW?: number;
  containerH?: number;
  headerAnimationTime?: number;
  imgLastTime?: number;
  imgEnterAnimationTime?: number;
  imgStaticTime?: number;
  imgLeaveAnimationTime?: number;
  frameRate?: number;
  headerWidth?: number;
  headerHeight?: number;
  headerPosition?: Position;
  floorplanWidth?: number;
  floorplanHeight?: number;
  floorplanPostion?: Position;
  imgWidth?: number;
  imgHeight?: number;
  imgPosition?: Position;
  headerImgSrc?: string;
  floorplanImgSrc?: string;
  houseImgSrcArr?: string[];
  blurRadius?: number;
  duration?: number;
  title?: string;
  titleArea?: {
    height: number;
    width: number;
  };
  titleAreaPostion?: Position;
  subTitle?: string;
  subTitleArea?: {
    height: number;
    width: number;
  };
  subTitleAreaPostion?: Position;
  onStart?: () => void;
  onProgress?: (progress: number) => void;
  onEnd?: (videoUrl: string) => void;
}
export const useVideoGenerator = (options: GenertorOptions) => {
  const {
    containerW = 360 * 2,
    containerH = 640 * 2,
    headerAnimationTime = 0.5,
    imgLastTime = 5,
    imgEnterAnimationTime = 1.5,
    imgStaticTime = 2,
    imgLeaveAnimationTime = 1.5,
    frameRate = 25,
    headerWidth = 280 * 2,
    headerHeight = 70 * 2,
    headerPosition = {
      left: (containerW - headerWidth) / 2,
      top: 50 * 2,
    },
    floorplanWidth = 200 * 2,
    floorplanHeight = 120 * 2,
    floorplanPostion = {
      left: (containerW - floorplanWidth) / 2,
      top: headerPosition.top + headerHeight - 35,
    },
    imgWidth = 360 * 2,
    imgHeight = 280 * 2,
    imgPosition = {
      left: 0,
      top: floorplanPostion.top + floorplanHeight + 50 * 2,
    },
    headerImgSrc = `${process.env.PUBLIC_URL}/image/header.jpg`,
    floorplanImgSrc = `${process.env.PUBLIC_URL}/image/floorplan.png`,
    houseImgSrcArr = [
      `${process.env.PUBLIC_URL}/image/house1.jpeg`,
      `${process.env.PUBLIC_URL}/image/house2.jpeg`,
      `${process.env.PUBLIC_URL}/image/house3.jpeg`,
      `${process.env.PUBLIC_URL}/image/house4.jpeg`,
      `${process.env.PUBLIC_URL}/image/house5.jpeg`,
      `${process.env.PUBLIC_URL}/image/house6.jpeg`,
    ],
    blurRadius = 10,
    duration = 30,
    title = "出租房源",
    titleArea = {
      height: 70,
      width: 180,
    },
    titleAreaPostion = {
      left: (containerW - titleArea.width) / 2,
      top: 40,
    },
    subTitle = "四室二厅 双井国贸",
    subTitleArea = {
      height: 56,
      width: headerWidth / 2,
    },
    subTitleAreaPostion = {
      left: (containerW - subTitleArea.width) / 2,
      top: headerPosition.top + 40,
    },
  } = options;

  // 每一帧集合
  const data: Blob[] = [];
  const totalFrameCount = Math.floor(duration * frameRate);
  let frameCount = 0;

  const canvas = document.createElement("canvas");
  canvas.width = containerW;
  canvas.height = containerH;
  const ctx = canvas.getContext("2d")!;

  const stream = canvas.captureStream(frameRate);
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  } catch (err1) {
    try {
      // Fallback for iOS
      recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
    } catch (err2) {
      // If fallback doesn't work either. Log / process errors.
      console.error({ err1 });
      console.error({ err2 });
    }
  }

  recorder!.ondataavailable = function (event) {
    if (event.data && event.data.size) {
      data.push(event.data);
    }
  };

  recorder!.onstop = () => {
    const blob = new Blob(data, { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(blob);

    // 这里可以将 videoUrl 用于播放或下载
    // 例如，将其插入到一个 <video> 标签中以播放视频
    const video = document.createElement("video");
    video.controls = true;
    video.src = videoUrl;
    document.body.appendChild(video);

    options.onEnd && options.onEnd(videoUrl);
  };

  let headerImgObj: HTMLImageElement;
  let floorplanImgObj: HTMLImageElement;
  let houseImgObjArr: HTMLImageElement[] = [];

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject("加载图片失败");
      };
    });
  };

  const loadAllImage = async () => {
    console.log("start to loadAllImage");

    headerImgObj = await loadImage(headerImgSrc);
    floorplanImgObj = await loadImage(floorplanImgSrc);

    houseImgObjArr = await Promise.all(
      houseImgSrcArr.map((src) => loadImage(src))
    );

    console.log("load all image success", houseImgObjArr);
  };

  const drawArea = (
    left: number,
    top: number,
    width: number,
    height: number
  ) => {
    ctx?.moveTo(left, top); //将画笔移动到坐标 x和y
    ctx?.lineTo(left + width, top); //从画笔位置绘制直线到坐标 x和y
    ctx?.lineTo(left + width, top + height); //从当前位置绘制直线到
    ctx?.lineTo(left, top + height); //.从当前位置...
    ctx?.closePath(); //闭合线条
    ctx.fillStyle = "white";
    ctx.fill(); //设置封闭图形填充
  };
  const drawFrame = (img: HTMLImageElement, index: number) => {
    ctx?.clearRect(0, 0, containerW, containerH);
    // 绘制背景图
    ctx?.drawImage(img, 0, 0, containerW, containerH);
    StackBlur.canvasRGB(canvas, 0, 0, containerW, containerH, blurRadius);

    // 绘制户型图
    ctx?.drawImage(
      floorplanImgObj,
      floorplanPostion.left,
      floorplanPostion.top,
      floorplanWidth,
      floorplanHeight
    );

    // 绘制header动画
    const startTop = headerHeight * -1;
    const endTop = headerPosition.top;
    const totalAnimationFrame = headerAnimationTime * frameRate;
    const movePerFrame = (endTop - startTop) / totalAnimationFrame;
    if (index < totalAnimationFrame) {
      console.log("draw headerImgObj, top", startTop + index * movePerFrame);
      ctx?.drawImage(
        headerImgObj,
        headerPosition.left,
        startTop + index * movePerFrame,
        headerWidth,
        headerHeight
      );
    } else {
      ctx?.drawImage(
        headerImgObj,
        headerPosition.left,
        headerPosition.top,
        headerWidth,
        headerHeight
      );
    }

    // 绘制房源图片
    const startLeftOfEnter = imgWidth * -1;
    const endLeftOfEnter = imgPosition.left;
    const startLeftOfLeave = imgPosition.left;
    const endLeftOfLeave = containerW;
    const totalEnterAnimationFrame = imgEnterAnimationTime * frameRate;
    const totalStaticFrame = imgStaticTime * frameRate;
    const totalLeaveAnimationFrame = imgLeaveAnimationTime * frameRate;
    const enterMovePerFrame =
      (endLeftOfEnter - startLeftOfEnter) / totalEnterAnimationFrame;
    const leaveMovePerFrame =
      (endLeftOfLeave - startLeftOfLeave) / totalLeaveAnimationFrame;
    // 确认当前图片是进入/静止/离开 状态
    const mod = index % (imgLastTime * frameRate);

    if (mod < totalEnterAnimationFrame) {
      // 当前是进入时间
      ctx?.drawImage(
        img,
        startLeftOfEnter + mod * enterMovePerFrame,
        imgPosition.top,
        imgWidth,
        imgHeight
      );
    } else if (mod < totalEnterAnimationFrame + totalStaticFrame) {
      // 当前是静止时间
      ctx?.drawImage(
        img,
        imgPosition.left,
        imgPosition.top,
        imgWidth,
        imgHeight
      );
    } else {
      // 当前是离开时间
      const currIndex =
        mod - (imgEnterAnimationTime + imgStaticTime) * frameRate;
      ctx?.drawImage(
        img,
        startLeftOfLeave + currIndex * leaveMovePerFrame,
        imgPosition.top,
        imgWidth,
        imgHeight
      );
    }

    // 绘制文字区域
    drawArea(
      titleAreaPostion.left,
      titleAreaPostion.top,
      titleArea.width,
      titleArea.height
    );
    drawArea(
      subTitleAreaPostion.left,
      subTitleAreaPostion.top,
      subTitleArea.width,
      subTitleArea.height
    );

    ctx.font = "40px 宋简体"; //文字大小
    ctx.fillStyle = "orange"; //文字颜色
    ctx.fillText(title, titleAreaPostion.left + 12, titleAreaPostion.top + 50);

    ctx.font = "30px 宋简体"; //文字大小
    ctx.fillStyle = "black"; //文字颜色
    ctx.fillText(
      subTitle,
      subTitleAreaPostion.left + 12,
      subTitleAreaPostion.top + 40
    );

    ctx.font = "35px 宋简体"; //文字大小
    ctx.fillStyle = "#ffa500"; //文字颜色
    ctx.fillText(
      "随时看房 首次出租",
      imgPosition.left + 200,
      imgPosition.top + imgHeight - 30
    );
    ctx.fillText(
      "空房出租 电梯房",
      imgPosition.left + 220,
      imgPosition.top + imgHeight + 30
    );
  };

  const update = () => {
    const index = Math.floor(frameCount / (imgLastTime * frameRate));
    const img = houseImgObjArr[index];

    const time = frameCount / frameRate;
    console.log(
      `Rendering frame ${frameCount} at ${
        Math.round(time * 10) / 10
      } seconds...`
    );
    options.onProgress &&
      options.onProgress(Math.floor((frameCount / totalFrameCount) * 100));
    drawFrame(img, frameCount);
    frameCount++;
    if (frameCount < totalFrameCount) {
      requestAnimationFrame(update);
    } else {
      recorder.stop();
    }
  };

  const generateVideo = () => {
    recorder.start();
    options.onStart && options.onStart();
    update();
  };

  return {
    loadAllImage,
    generateVideo,
  };
};
