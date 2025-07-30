const toYMD = (dateObj) => {
   if(!dateObj || typeof dateObj != 'object' || typeof dateObj.getTime !== 'function') {
        return dateObj
    }
    return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2,0)}-${dateObj.getDate().toString().padStart(2,0)}`
}

const toHumanDate = (d) => {
    return (new Date(d)).toDateString()
}

const addDays = (date, number) => {
    const newDate = new Date(date);
    return new Date(newDate.setDate(date.getDate() + number));
  }
  
  const addMonths = (date, number) => {
    const newDate = new Date(date);
    return toYMD(new Date(newDate.setMonth(newDate.getMonth() + number)));
  }
  
  const addYears = (date, number) => {
    const newDate = new Date(date);
    return toYMD(new Date(newDate.setFullYear(newDate.getFullYear() + number)));
  }
  
  const getNewDate = (dateTime) => {
    let date = new Date();
    let number = parseInt(dateTime.match(/\d+/)[0]);
  
    if (dateTime.indexOf('-') != -1)
      number = (-number);
  
    if (dateTime.indexOf('day') != -1)
      date = addDays(date, number);
    else if (dateTime.indexOf('month') != -1)
      date = addMonths(date, number);
    else if (dateTime.indexOf('year') != -1)
      date = addYears(date, number);
  
    return date;
  }

const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const transformRequestOptions = params => {
    let options = '';
    for (const key in params.filters) {
        options += `filters[${key}]=${params.filters[key]}&`;
    }
    return options ? options.slice(0, -1) : options;
 };

 const guidGenerator = () => {
  const S4 = function(){
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

const removeSpecialCharacters = (description) => {
  // Regular expression to match all non-alphanumeric characters
  const regex = /[^a-zA-Z0-9\s]/g;
  
  // Replace all non-alphanumeric characters with an empty string
  const cleanedDescription = description.replace(regex, '');

  return cleanedDescription;
}

export default  {
    toYMD,
    getNewDate,
    addDays,
    addMonths,
    addYears,
    toHumanDate,
    transformRequestOptions,
    capitalizeFirstLetter,
    guidGenerator,
    removeSpecialCharacters
}