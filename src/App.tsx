import {ChangeEvent, useEffect, useRef, useState} from "react";
import styles from "./App.module.scss";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {fileTreeSelector} from "./store/selector.ts";
import {setFileTree} from "./store/fileTreeSlice.ts";

const allowedExtensions = ["msi", "exe"];

const getFiles = async (): Promise<FileToShow[]> => {
	const {data} = await axios.get<FileToShow[]>("http://localhost:3000/api/files");
	return data;
};

interface FileToShow {
	name: string;
	children: FileToShow[] | [];
}

function App() {
	const fileTree = useSelector(fileTreeSelector);
	const dispatch = useDispatch();

	const [notifications, setNotifications] = useState<string[]>([]);
	const [allFiles, setAllFiles] = useState<FileToShow[]>();
	const [files, setFiles] = useState<FileList | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [loading, setLoading] = useState(false);

	const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		const file = files ? files : null;

		if (file) {
			setFiles(file);
		} else {
			console.error("File is null");
		}
	};

	const uploadFile = async () => {
		if (!files) return;

		const formData = new FormData();
		
		Object.values(files).forEach(file => {
			formData.append("files", file)
		})
		
		try {
			setLoading(true);
			await axios.post("http://localhost:3000/api/files/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: function (progressEvent) {
					const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
					setLoadingProgress(percentCompleted);
				},
			});
			setLoading(false);
			setLoadingProgress(0);

			// if (file) setNotifications(prev => [...prev, file?.name]);

			setTimeout(() => {
				setNotifications([]);
			}, 4000);

			const files = await getFiles();
			dispatch(setFileTree(files));
			setAllFiles(files);
			setFiles(null);
			if (inputRef.current) inputRef.current.value = "";
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		getFiles().then(res => {
			setAllFiles(res);
			dispatch(setFileTree(res));
		});
	}, []);

	console.log(fileTree);

	return (
		<div>
			{loading ?
				<>
					<div className={styles.loadingProgress} style={{width: loadingProgress + "%"}} />
					<div className={styles.loadingScreen}>loading...</div>
				</>
				: null
			}
			<div>
				<input ref={inputRef} type="file" onChange={onUpload} multiple />
				<button disabled={!files} onClick={uploadFile}>Upload</button>
			</div>
			<div className={styles.tempWrapper}>
				<div className={styles.sidebar}>
					{fileTree.length ? fileTree.map(item => (
						<Entry key={item.name} entry={item} depth={1} />
					)) : null}
				</div>
				<div>
					{allFiles
						? <div className={styles.files}>
							{allFiles.map((file, i) => {
								const split = file.name.split(".");
								const extension = split[split.length - 1];

								return <div className={styles.file} key={i}>
									<span>{file.name}</span>
									{allowedExtensions.includes(extension) &&
                      <>
                          <span>Download</span>
                          <a className={styles.downloadLink}
                             href={`http://localhost:3000/downloads/${file.name}`}
                          />
                      </>
									}
								</div>;
							})}
						</div>
						: null
					}
				</div>
			</div>

			{notifications
				? <div className={styles.notifications}>
					{notifications.map(item => {
						return <div key={item} className={styles.notification}>{item} was uploaded successfully!</div>;
					})}
				</div>
				: null
			}
		</div>
	);
}

const Entry = ({entry, depth}: { entry: FileToShow, depth: number }) => {
	const [open, setOpen] = useState<boolean>(false);

	const hasChildren = !!entry.children?.length;

	return <div>
		{hasChildren
			? <div style={{cursor: "pointer"}} onClick={() => setOpen(!open)}>{open ? "-" : "+"} {entry?.name}</div>
			: <div>{entry.name}</div>
		}
		{hasChildren && open && <div style={{marginLeft: depth * 5 + "px"}}>
			{entry?.children?.map((item, i) => (
				<Entry entry={item} depth={depth + 1} key={i} />
			))}
    </div>}
	</div>;
};

export default App;
