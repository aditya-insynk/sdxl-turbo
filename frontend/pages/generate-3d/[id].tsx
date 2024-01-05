// @ts-nocheck
/// <reference no-default-lib="true"/>

import Head from "next/head";
import React, { lazy, useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { styled } from "styled-components";
import { useAppState } from "@/context/app.context";
import { motion } from "framer-motion";
import PopupUpload from "@/components/Popup";
import Loader from "@/components/Loader";
import BottomTab from "@/components/BottomTab";
import CanvasBox from "@/components/Canvas";
import { useSession } from "@supabase/auth-helpers-react";
import Regeneret from "@/components/Popup/Regeneret";
import { useRouter } from "next/router";
import Canvas3d from "@/components/Canvas/Canvas3d";
import Sidebar3d from "@/components/Sidebar/Generate3d";
import { supabase } from "@/utils/supabase";
import Canvas3dLarge from "@/components/Canvas/Canvas3dLarge";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
};

export default function Home() {
  const session = useSession();
  const { query, isReady } = useRouter();
  const id = (query.id as string[]) || [];

  const {
    outerDivRef,
    popup,
    generatedImgList,
    selectedImg,
    setSelectedImg,
    loader,
    addimgToCanvasGen,
    setLoader,
    canvasInstance,
    modifidImageArray,
    setModifidImageArray,
    fetchGeneratedImages,
    regeneratePopup,
    GetProjextById,
    setDownloadImg,
    jobId,
    addimgToCanvasSubject,
    projectId,
    setprojectId,
    setGeneratedImgList,
    filteredArray,
    setFilteredArray,
    jobIdOne,
    setJobIdOne,
    setCanvasDisable,
    setassetsActiveTab,
    TDMode,
    userId,
    setUserID,
    set3dMode,
    getSupabaseImage,
  } = useAppState();

  useEffect(() => {
    if (isReady) {
      GetProjextById(id);

      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUserID(data.session.user.id);
        }
      };
      checkSession();
    }
    set3dMode(true);
  }, [id, isReady, TDMode, session]);

  useEffect(() => {
    const times = setInterval(() => {
      if (isReady && userId) {
        fetchGeneratedImages(userId);
      }
    }, 5000);

    return () => {
      clearInterval(times);
    };
  }, []);

  const upateImage = (url) => {
    if (!loader) {
      addimgToCanvasGen(url);
      setSelectedImg({ status: true, image: url });
      setDownloadImg(url);
    }
  };

  useEffect(() => {
    setprojectId(id);
    setassetsActiveTab("product");
    const canvas1 = canvasInstance.current;

    const objects = canvas1?.getObjects();
    const subjectObjects = [];
    objects?.forEach((object: any) => {
      if (object.category === "subject") {
        subjectObjects.push(object);
      }
    });
  }, [jobIdOne, setGeneratedImgList, regeneratePopup]);

  useEffect(() => {
    let time = setInterval(() => {
      if (isReady && userId) {
        polling3dGenertedImages();
      }
    }, 5000);
    return () => {
      clearInterval(time);
    };
  }, [isReady, userId, jobIdOne]);

  const polling3dGenertedImages = async () => {
    try {
      const data = await getSupabaseImage();

      if (data) {
        const filteredResultss = await data?.filter(
          (obj: any) => obj?.is_3d === true
        );

        const filteredResults = await filteredResultss?.filter((obj: any) =>
          jobIdOne?.includes(obj?.task_id)
        );
        if (filteredResults?.length) {
          setLoader(false);
          setCanvasDisable(true);
          setisOpen(true);
          setJobIdOne([]);
        }

        setFilteredArray(filteredResultss);
      }
      return data;
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const [isOpen, setisOpen] = useState(true);
  const [hidden, setHidden] = useState(isOpen);
  return (
    <MainPages>
      <div className="news">
        {popup?.status ? <PopupUpload /> : null}

        <Sidebar3d />
        <div className="Editor" ref={outerDivRef}>
          {regeneratePopup.status ? <Regeneret /> : null}
          <Canvas3d />
          {filteredArray?.length > 0 ? (
            <div className="generatedBox">
              <motion.div
                className="itemsWrapper"
                hidden={hidden}
                initial={false}
                onAnimationStart={() => setHidden(false)}
                onAnimationComplete={() => setHidden(!isOpen)}
                animate={{
                  width: isOpen ? "100%" : 0,
                  padding: isOpen ? "15px" : "0",
                }}
              >
                {filteredArray?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="items"
                    onClick={() => upateImage(item?.modified_image_url)}
                  >
                    <picture>
                      <img src={item?.modified_image_url} alt="" />
                    </picture>
                  </div>
                ))}
              </motion.div>
              {isOpen ? (
                <button
                  className="large"
                  onClick={() => {
                    // setHidden(false);
                    setisOpen(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-chevron-right"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              ) : (
                <button
                  className="large"
                  onClick={() => {
                    // setHidden(true);
                    setisOpen(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </MainPages>
  );
}

const MainPages = styled.div`
  position: relative;
  height: 100%;
  .large {
    background-color: #f9d00d;
    padding: 4px;
  }
  .generated {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(249, 208, 13, 1);
    border-radius: 16px;

    /* overflow: hidden; */

    img {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      transition: all 0.3s ease;
    }
  }
  .canvase {
    display: grid;
    padding-right: 100px !important;
    grid-template-columns: 1fr 1fr;
    height: 75%;
    gap: 2rem;
    padding: 20px;
    padding-top: 100px;
  }

  .generatedBox {
    width: calc(100vw - 490px);
    display: flex;
    /* height: 300px; */
    position: fixed;
    bottom: 0px;
    /* padding-right: 30px; */
    /* left: 20px; */
    right: 0px;
    justify-content: right;
    z-index: 10;
    z-index: 100;

    .itemsWrapper {
      display: flex;
      /* flex-direction: column; */
      width: 100%;
      gap: 10px;
      background-color: rgba(248, 248, 248, 1);
      padding: 10px 20px;
      border-radius: 8px;
      overflow: auto;

      &::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      /* Track */
      &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
        border-radius: 10px;
        height: 7px;
      }

      /* Handle */
      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
      }
    }
    .items {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 4px;
      min-width: 100px;
      overflow: hidden;
      &:hover {
        transform: scale(1.1);
      }

      img {
        width: 100px;
        height: 100px;
      }
    }
    .itemsadd {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 4px;
      min-width: 100px;
      overflow: hidden;
      width: 100px;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #dee0e0;

      &:hover {
        transform: scale(1.1);
      }

      img {
      }
    }
  }

  display: block;
  width: 100%;
  min-height: 100vh;
  .news {
    display: flex;
    min-width: 100%;
  }
  .loader {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #29262640;
    font-size: 24px;
    color: #f9d00d;
    z-index: 3;
  }
  .loaderq {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background: #e6e6e60; */
    font-size: 24px;
    color: #f9d00d;
    z-index: 3;
    border-radius: 12px;
  }
  .overlay {
    position: fixed;
    z-index: 999;
    top: 100px;
  }
  .Editor {
    width: 100%;
    height: 100vh;
    position: relative;

    overflow: auto;
    /* height: 100vh; */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
    /* padding-top: 100px; */

    &::-webkit-scrollbar {
      display: none;
      width: 10px;
      height: 10px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px grey;
      border-radius: 10px;
      height: 7px;
      display: none;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      display: none;
    }
  }

  .convas-continer {
    /* border: 1px solid #434343; */
    width: 100%;
    min-height: 100%;
    position: absolute;
    top: 0;
  }

  .tgide {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    .preBox {
      position: relative;
      font-size: 10px;
      font-weight: 500;
      border: 2px solid #f9d00d;
      padding: 1rem;
      min-height: 350px;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .close {
        position: absolute;
        right: 20px;
        top: 10px;
        font-size: 18px;
        cursor: pointer;
      }

      .imgadd {
        margin: 10px 0;
        width: 100%;
        max-height: 250px;
      }
      .more {
        padding: 0 50px;
        width: 100%;
        height: 100%;
        position: relative;
        .file {
          position: absolute;
          height: 100%;
          width: 100%;
          left: 0;
        }
      }
      picture {
        width: 100%;
        height: 100%;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .center {
        text-align: center;
      }
    }
  }

  .undoBox {
    position: absolute;
    bottom: 100px;
    left: 0;
    z-index: 10;
    width: 100%;
    .undoWrapper {
      display: flex;
      gap: 30px;
      justify-content: center;
      width: 100%;

      .undo {
        picture {
        }
        img {
          cursor: pointer;
          width: 50px;
          height: 50px;
        }
      }
    }
  }
  .tgrideOne {
    position: relative !important;
    display: grid;
    grid-template-columns: 1fr;
    .magicPrevie {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 500px;
      width: 100%;

      canvas {
        z-index: 30000;
      }
    }
  }
  .tools {
    display: flex;
    gap: 10px;
    justify-content: start;
    align-items: center;
    .btn {
      padding: 10px 30px !important;
      background: transparent;
      border: 1px solid ${({ theme }) => theme.btnPrimary};
      font-weight: 500;
    }
    .button {
      padding: 10px 80px !important;
      /* background: transparent;
    border: 1px solid ${({ theme }) => theme.btnPrimary} */
      width: max-content;
    }
    input[type="range"] {
      /* overflow: hidden; */
      width: 250px;
      height: 15px;
      -webkit-appearance: none;
      background-color: ${({ theme }) => theme.btnPrimary};
      border-radius: 12px;
    }

    input[type="range"]::-webkit-slider-runnable-track {
      height: 20px;
      -webkit-appearance: none;
      color: #13bba4;
      margin-top: -10px;
    }

    input[type="range"]::-webkit-slider-thumb {
      width: 30px;
      -webkit-appearance: none;
      height: 30px;
      border-radius: 50%;
      /* margin-top: -4px; */
      cursor: ew-resize;
      background: #434343;
      /* box-shadow: -80px 0 0 80px #43e5f7; */
    }

    .activeTool {
      background: ${({ theme }) => theme.btnPrimary};
    }
  }
  .closs {
    position: absolute;
    right: 50px;
    top: 0px;
    font-size: 28px;
    cursor: pointer;
  }

  .sample-canvas {
    border: 1px solid #555;
  }
  .canvas-style {
    width: 100%;
    height: 100%;
    display: block;
  }
`;
