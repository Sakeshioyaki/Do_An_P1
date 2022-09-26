async function getDetailAddress(address) {
  let indexOfStress = address.indexOf("Đường");
  if (indexOfStress == -1) {
    indexOfStress = address.indexOf("Phố");
    if (address.indexOf("Thành Phố") != -1) {
      indexOfStress = -1;
    }
  }

  let indexOfWard = address.indexOf("Phường");
  if (indexOfWard == -1) {
    indexOfWard = address.indexOf("Xã");
    if (indexOfWard == -1) {
      indexOfWard = address.indexOf("Thị trấn");
    }
  }

  let indexOfDistrict = address.indexOf("Quận");
  if (indexOfDistrict == -1) {
    indexOfDistrict = address.indexOf("Huyện");
    console.log("huyen :", indexOfDistrict);

    if (indexOfDistrict == -1) {
      indexOfDistrict = address.indexOf("Thị Xã");
      console.log("thi xa :", indexOfDistrict);
      if (indexOfDistrict == -1) {
        indexOfDistrict = address.indexOf("Thành Phố");
        console.log("thanh pho :", indexOfDistrict);
      }
    }
  }
  const sCity = address.lastIndexOf(",") + 1; // return -1 if can't search
  const city = address.substring(sCity, address.length);

  let district = address.substring(indexOfDistrict, sCity - 1);
  console.log("ten quan huyen thi xa : " + indexOfDistrict);

  console.log("ten quan huyen thi xa : " + district);

  let stress = "";
  if (indexOfStress != -1) {
    if (indexOfWard != -1) {
      stress = address.substring(indexOfStress, indexOfWard - 2);
    } else {
      stress = address.substring(indexOfStress, indexOfDistrict - 2);
    }
  }
  let ward = "";
  if (indexOfWard != -1) {
    ward = address.substring(indexOfWard, indexOfDistrict - 2);
  }

  let detailMore = "";

  if (indexOfStress == -1) {
    detailMore = address.substring(0, indexOfWard);
  } else {
    detailMore = address.substring(0, indexOfStress);
  }

  const detailAddress = {
    more: detailMore.trim(),
    stress: stress.trim(),
    ward: ward.trim(),
    district: district.trim(),
    city: city.trim(),
  };

  return detailAddress;
}

export default { getDetailAddress };
