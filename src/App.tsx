import { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";

const extensions = ["msi", "exe"];

const getFiles = async (): Promise<string[]> => {
  const { data } = await axios.get<string[]>("http://localhost:3000/api/files");
  console.log();
  return data;
};

function App() {
  const [allFiles, setAllFiles] = useState<string[]>();
  const [file, setFile] = useState<File>();

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

      const files = await getFiles();
      setAllFiles(files);
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
    <div>
      <input type="file" onChange={onUpload} />
      <button disabled={!file} onClick={uploadFile}>Upload</button>
      {allFiles?.map((fileName, i) => {
        const split = fileName.split(".");
        const extension = split[split.length - 1];

        return <div key={i}>
          {fileName}
          {extensions.includes(extension) &&
            <a download href={`http://localhost:3000/downloads/${fileName}`}>Download</a>}
        </div>;
      })}
    </div>
  );
}

export default App;
