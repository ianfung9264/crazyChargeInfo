import { useEffect, useState } from "react";

import "./App.css";
import axios from "axios";

function App() {
	const statusDescriptions = {
		1: "告警",
		2: "待机",
		3: "充电中",
		4: "离线",
		5: "已完成",
		6: "已暂停",
		7: "已插枪",
		8: "预约中",
		9: "已禁用",
	};
	const lockStatusDescription = {
		0: "未知",
		10: "已解锁",
		50: "已上锁",
	};
	const parkStatusDescription = {
		0: "未知",
		10: "空闲",
		50: "占用",
	};

	const [connectors, setConnectors] = useState([]);
	const [responseData, setResponseData] = useState("");
	const [responseCode, setResponseCode] = useState("");
	const [disabled, setDisabled] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const BEARER_TOKEN =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE5MjMxNjg3NyIsInJvbGUiOiJ0ZXN0IiwiaWF0IjoxNzIyMzI2NjI1LCJleHAiOjE4MDg2NDAyMjV9.ajKLIzChv17kq3R23FzWYBHkWP0GAH3sUEXouWzd_J0";
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const response = await axios.get(
					"https://test.crazycharge.com.hk/api/v1/clients/chargestations/resources/status",
					{
						headers: {
							Authorization: `Bearer ${BEARER_TOKEN}`,
						},
					}
				);
				const stationInfo = response.data.data.StationStatusInfos[0];
				const filteredConnectors = stationInfo.ConnectorStatusInfos.filter(
					(connector) => connector.ConnectorID === "101708240502480001"
				);

				setConnectors(filteredConnectors[0]);
				setLoading(false);
				// console.log(connectors.ConnectorID);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleStartClick = async () => {
		setLoading(true);
		setDisabled(true);

		const generateRandomID = () => {
			const base = "730998640";
			const date = new Date();
			const yyyyMMddHHmmss = date
				.toISOString()
				.replace(/[-T:\.Z]/g, "")
				.slice(0, 14);
			const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit random number
			return `${base}${yyyyMMddHHmmss}${randomDigits}`;
		};

		const oldRandomID = localStorage.getItem("randomID");
		if (oldRandomID) {
			localStorage.removeItem("randomID");
		}
		const randomID = generateRandomID();
		localStorage.setItem("randomID", randomID);
		try {
			const response = await axios.put(
				`https://test.crazycharge.com.hk/api/v1/clients/chargestations/resources/charge/start?StartChargeSeq=${randomID}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${BEARER_TOKEN}`,
					},
				}
			);
			console.log("Start request successful:", response.data);
			console.log(`response.data.code is ... ${response.data.code}`);
			console.log(`response.data.data is ... ${response.data.data}`);
			console.log("random ID generated:", randomID);
			setResponseCode(response.data.code);
			setResponseData(response.data.data);
		} catch (error) {
			console.error("Error sending start request:", error);
			if (error.response) {
				console.log("Error response data:", error.response.data.message);
				setResponseData(error.response.data.message);
			}
		} finally {
			setLoading(false);
			setTimeout(() => setDisabled(false), 3000);
		}
	};

	const handleStopClick = async () => {
		setLoading(true);
		setDisabled(true);
		const randomID = localStorage.getItem("randomID");
		if (!randomID) {
			console.error("No random ID found in local storage.");
			setLoading(false);
			setDisabled(false);
			return;
		}
		try {
			const response = await axios.put(
				`https://test.crazycharge.com.hk/api/v1/clients/chargestations/resources/charge/stop?StartChargeSeq=${randomID}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${BEARER_TOKEN}`,
					},
				}
			);
			console.log(`The random ID for this stop request is..: ${randomID}`);
			console.log("Stop request successful:", response.data);
			console.log(`Response data code is.. ${response.data.code}`);
			console.log(`Response data message is.. ${response.data.data}`);

			setResponseCode(response.data.code);
			setResponseData(response.data.data);

			// setResponseData(response.data);
		} catch (error) {
			if (error.response) {
				console.log("Error response data:", error.response.data.message);
				console.log("testing", error.response.data.statusCode);
				setResponseCode(error.response.data.statusCode);
				setResponseData(error.response.data.message);
			} else {
				console.log(error);
			}
		} finally {
			setLoading(false);
			setTimeout(() => setDisabled(false), 10000);
		}
	};

	return (
		<div className="bg-[#1b1b1f]  min-h-screen min-w-screen flex flex-col items-center justify-center text-white">
			<div>
				<h1 className=" bold text-4xl">Connector Status</h1>
				<div className="mt-12">
					{loading ? (
						<p>loading ...</p>
					) : (
						<>
							<p>Connector ID: {connectors.ConnectorID}</p>
							<p>
								LockStatus:
								{" " + connectors.LockStatus + "--" + lockStatusDescription[connectors.LockStatus]}{" "}
							</p>
							<p>
								ParkStatus:
								{" " + connectors.ParkStatus + "--" + parkStatusDescription[connectors.ParkStatus]}
							</p>
							<p>Status: {" " + connectors.Status + "--" + statusDescriptions[connectors.Status]}</p>
						</>
					)}
				</div>
			</div>

			<div className="mt-10 ">
				<button
					onClick={() => handleStartClick()}
					style={{
						backgroundColor: "green",
						color: "white",
						padding: "10px 20px",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
						marginRight: "10px",
					}}
				>
					Start
				</button>
				<button
					onClick={() => handleStopClick()}
					style={{
						backgroundColor: "red",
						color: "white",
						padding: "10px 20px",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
						marginRight: "10px",
					}}
				>
					Stop
				</button>
				<button
					onClick={() => window.location.reload()}
					style={{
						backgroundColor: "blue",
						color: "white",
						padding: "10px 20px",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					Refresh
				</button>
			</div>

			<div className="flex flex-col items-center justify-center">
				<h1 className="bold text-4xl mt-10">Response Data</h1>
				{/* <p className="mt-10  text-lg underline">Response Code: {responseCode ? responseCode : ""}</p> */}
				<p className="break-words" style={{ wordBreak: "break-all" }}>
					{`Response Data Code : ${responseCode}`}
				</p>
				<p className="break-words italic" style={{ wordBreak: "break-all" }}>
					{`Response Data Message : ${responseData}`}
				</p>
			</div>
		</div>
	);
}

export default App;
