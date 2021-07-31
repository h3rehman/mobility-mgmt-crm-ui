const cleanPhoneNumber = (str) => {
    if (str != null){
        //Removes all non-numeric characters from str
        let str2 = str.replace(/\D/g, "");
        return str2;
    }
    else {
        return null;
    }
}

export default cleanPhoneNumber;