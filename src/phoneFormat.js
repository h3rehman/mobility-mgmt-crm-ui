const phoneFormat = (str) => {
    if (str != null){
        //Removes all non-numeric characters from str
        let str2 = str.replace(/\D/g, "");
       //Add dashes to the phone number
        str2 = str2.slice(0,3)+"-"+str2.slice(3,6)+"-"+str2.slice(6);
    
        return str2;
    }
    else {
        return null;
    }
}

export default phoneFormat;