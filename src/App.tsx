import { ChangeEvent, useEffect, useRef, useState } from "react";
import styles from "./App.module.scss";
import axios from "axios";

const allowedExtensions = ["msi", "exe"];

const getFiles = async (): Promise<string[]> => {
  const { data } = await axios.get<string[]>("http://localhost:3000/api/files");
  console.log();
  return data;
};

function App() {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [allFiles, setAllFiles] = useState<string[]>();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files ? files[0] : null;

    if (file) {
      setFile(file);
    } else {
      console.error("File is null");
    }
  };

  const uploadFile = async () => {
    try {
      await axios.post("http://localhost:3000/api/files/upload", { file }, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (file) setNotifications(prev => [...prev, file?.name]);

      setTimeout(() => {
        setNotifications([]);
      }, 4000);

      const files = await getFiles();
      setAllFiles(files);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getFiles().then(res => {
      setAllFiles(res);
    });
  }, []);

  return (
    <>
      <input ref={inputRef} type="file" onChange={onUpload} />
      <button disabled={!file} onClick={uploadFile}>Upload</button>
      {allFiles
        ? <div className={styles.files}>
          {allFiles.map((fileName, i) => {
            const split = fileName.split(".");
            const extension = split[split.length - 1];

            return <div className={styles.file} key={i}>
              <span>{fileName}</span>
              {allowedExtensions.includes(extension) &&
                <>
                  <span>Download</span>
                  <a className={styles.downloadLink}
                     href={`http://localhost:3000/downloads/${fileName}`}
                  />
                </>
              }
            </div>;
          })}
        </div>
        : null
      }

      {notifications
        ? <div className={styles.notifications}>
          {notifications.map(item => {
            return <div className={styles.notification}>{item} was uploaded successfully!</div>;
          })}
        </div>
        : null
      }
    </>
  );
}

export default App;
