const fs = require('fs');
const path = require('path');
const cliProgress = require('cli-progress');

// 读取 JSON 文件
const file1 = JSON.parse(fs.readFileSync('./src/i18n/bs.json', 'utf-8'));
const file2 = JSON.parse(fs.readFileSync('./src/i18n/en.json', 'utf-8'));

// 获取所有键的集合
function getAllKeys(obj, parentKey = '') {
	let keys = [];
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			const fullKey = parentKey ? `${parentKey}.${key}` : key;
			keys.push(fullKey);
			if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
				keys = keys.concat(getAllKeys(obj[key], fullKey));
			}
		}
	}
	return keys;
}

const keys1 = getAllKeys(file1);
const keys2 = getAllKeys(file2);

// 找到 file1 中缺失的键
const missingInFile1 = keys2.filter(key => !keys1.includes(key));

// 找到 file2 中缺失的键
const missingInFile2 = keys1.filter(key => !keys2.includes(key));

// 遍历 src 目录并检查键的使用情况
const srcDir = path.join(__dirname, 'src');

function checkKeyInFile(key, fileContent) {
	const regex = new RegExp(`\\b${key}\\b`, 'g');
	return regex.test(fileContent);
}

function checkKeysInDir(keys, dir) {
	let unusedKeys = keys.slice();

	const files = [];
	function traverseDirectory(directory) {
		const dirFiles = fs.readdirSync(directory);
		for (let file of dirFiles) {
			const fullPath = path.join(directory, file);
			if (fs.statSync(fullPath).isDirectory()) {
				traverseDirectory(fullPath);
			} else {
				files.push(fullPath);
			}
		}
	}

	traverseDirectory(dir);

	// 初始化进度条
	const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
	progressBar.start(files.length, 0);

	files.forEach((file, index) => {
		const fileContent = fs.readFileSync(file, 'utf-8');
		unusedKeys = unusedKeys.filter(key => !checkKeyInFile(key, fileContent));
		progressBar.update(index + 1);
	});

	progressBar.stop();
	return unusedKeys;
}

const unusedKeys1 = checkKeysInDir(keys1, srcDir);
const unusedKeys2 = checkKeysInDir(keys2, srcDir);

// 输出结果
console.log('Keys missing in file1:', missingInFile1);
console.log('Keys missing in file2:', missingInFile2);
console.log('Unused keys from file1 in src directory:', unusedKeys1);
console.log('Unused keys from file2 in src directory:', unusedKeys2);

