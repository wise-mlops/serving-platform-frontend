/**
 * 이 클래스는 Date 복잡한 로직을 간편하게 사용하기 위한 클래스이다.
 * 이 클래스는 moment 라이브러리를 일부 활용되었습니다.
 *
 * @version     1.0.0 2017/09/24
 * @author      강준성(jskang)
 * @since       2017/09/24
 * @see         https://github.com/JunSungKang/Typescript/blob/master/WeUICore/weUICore/utils/time.util.ts
 */

import * as moment from 'moment';

const DATE_FORMAT: string = "YYYY-MM-DD";

/**
 * 원하는 포맷으로 현재 날짜를 얻어옴
 * @param format 날짜형식 (기본 값: YYYY-MM-DD)
 * @return 현재 날짜
 * @since 2017/09/24
 * @author 강준성(jskang)
 * */
export const getToday = (format: string = DATE_FORMAT) => {
	return moment(new Date()).format(format);
}

/**
 * 날짜를 원하는 포맷으로 변환
 * @param format 날짜형식 (기본 값: YYYY-MM-DD)
 * @return 원하는 포맷으로 변환
 * @since 2017/09/24
 * @author 강준성(jskang)
 * */
export const getFromFormat = (date: Date, format: string = DATE_FORMAT) => {
	return moment(date).format(format);
}

/**
 * 원하는 몇일 전 날짜를 알려줌
 * @param unit "Year": 몇 년전?, "Month": 몇 달전?, "Day": 몇 일전?
 * @return 현재 날짜
 * @since 2017/09/24
 * @author 강준성(jskang) 
 */
export const getBeforeday = (unit: string, value: number, format: string = DATE_FORMAT) => {
	var date = new Date();

	if(unit == "Year"){
		date.setFullYear(date.getFullYear() - value.valueOf());
	}else if(unit == "Month"){
		date.setMonth(date.getMonth() - value.valueOf());
	}else if(unit == "Day"){
		date.setDate(date.getDate() - value.valueOf());
	}
	return getFromFormat(date, format);
}

/**
 * 날짜형식의 문자열을 Tiemstamp로 변환
 * @param value 날짜 형식
 * @return Timestamp형식 ex)1564651321415
 * @author 박유찬(YcBak)
 * */
export const getTimestamp = (value: any) => {
	var rslt;
	if (value.length == 8) {
		rslt = new Date(value.substring(0, 4), value.substring(4, 6) - 1, value.substring(6)).getTime();
	} else {
		rslt = new Date(Date.parse(value)).getTime();
	}
	return rslt;
}

/**
 * 시작날짜와 마지막날짜가 몇일차이인지 계산
 * @param val1 시작 날짜(ex. 2017/09/15등 10자로 된 날짜 포맷)
 * @param val2 끝나는 날짜(ex. 2017/09/15등 10자로 된 날짜 포맷)
 * @return 시작과 마지막 날짜의 일수 계산
 * @since 2017/09/24
 * @author 강준성(jskang)
 * */
export const calDateRange = (val1: any, val2: any) => {
	// FORMAT을 포함한 길이 체크
	if (val1.length != 10 || val2.length != 10) {
		return {"error": "function calDateRange(), Date format error."};
	}
	// 년도, 월, 일로 분리
	let start_dt: any = [
		Number.parseInt(val1.substring(0, 4)), val1.substring(5, 7) - 1, Number.parseInt(val1.substring(8))
	]
	let end_dt: any = [
		Number.parseInt(val2.substring(0, 4)), val2.substring(5, 7) - 1, Number.parseInt(val2.substring(8))
	]
	// 월 - 1(월이 0부터 시작하기 때문에...)
	// Number()를 이용하여 08, 09월을 10진수로 인식하게 함.
	start_dt[1] = (Number(start_dt[1]) - 1) + "";
	end_dt[1] = (Number(end_dt[1]) - 1) + "";

	var from_dt = new Date(start_dt[0], start_dt[1], start_dt[2]);
	var to_dt = new Date(end_dt[0], end_dt[1], end_dt[2]);

	return (to_dt.getTime() - from_dt.getTime()) / 1000 / 60 / 60 / 24; // 1000 / 60 / 60 / 24;
}

/**
 * 날짜형식의 String인지 체크, 아닐 경우 false을 반환
 * @param dateVal 날짜형식 ex)"2017/07/15" 등
 * @return 날짜인 경우 true, 날짜가 아닌 경우 false
 * @author 박유찬(YcBak)
 * */
export const isDate = (dateVal: string) => {
	var rslt = true;
	if (new Date(Date.parse(dateVal)).toString() == "Invalid Date") {
		rslt = false;
	}
	return rslt;
}

/**
 * value값이 type에서 지정한 날짜형식에 맞으면 true반환
 * @param value ex)"2017-07-15", "14:30:06", "2001-09-09 14:30:06"
 * @param type date, time, all
 * @return 날짜 형식인 경우 true, 날짜 형식이 아닌 경우 false
 * @author 박유찬(YcBak) 
 * */
export const isDateTypeByString = (value: string, type: string) => {
	var validateTimeFormat = null;
	if (type == "date") {
		validateTimeFormat = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
	} else if (type == "time") {
		validateTimeFormat = /^([1-9]|[01][0-9]|2[0-3]):([0-5][0-9])$/;
	}
	/*시간 지정 안할경우 */
	else if (type == "all" && value.length < 11) {
		validateTimeFormat = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
	} else {
		validateTimeFormat = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01]) (0\d|1\d|2[0-3]):[0-5]\d:[0-5]\d$/;
	}
	return validateTimeFormat.test(value);
}