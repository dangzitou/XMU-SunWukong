function milliSecond(){
	const timestampMs = Date.now();
	return timestampMs;
}

function second(){
	const timestampMs = Date.now();
	const timestampSeconds = Math.floor(timestampMs / 1000);
	return timestampSeconds;
}

module.exports = {
	milliSecond,
	second
}
