INFOR
------------
 * Đây là mô đun có chức năng thu thập dữ liệu nhà trọ, là một phần nằm trong đồ án tốt nghiệp bậc kỹ sư tại trường Đại học Bách khoa của mình.
 * Phần thứ 2 là mã nguồn sever có chức năng cung cấp API đưa ra danh sách nhà trọ được gợi ý cho người dùng. Link:  https://github.com/Sakeshioyaki/Sever_Do_An
 * Phần còn lại là ứng dụng mobie về hệ thống cho thuê nhà trọ mình không thể public :))
  
 * Link quyển đồ án file latex online: https://www.overleaf.com/read/mvpmczpjfxdd


INSTALLATION
------------
 
 * Cài đặt Nodejs : https://nodejs.org/en/download/

 * Kết nối với fireBase của bạn: 
    - Tạo project với filebase tại: https://console.firebase.google.com/
    - Vào project của bạn > Setting  > Service accounts, chọn `Generate new private key`  để tải về file json có chứa config kết nối tới database của bạn.  Coppy nội file json bạn vừa tải vào config_database > key2.js. 

 * run `npm start` hoặc `node main.js` là đủ rồi. 
  
 * Ngoài ra hãy chuẩn bị tinh thần mạng khoẻ máy đủ pin vì quá trình thu thập dữ liệu có thể diễn ra khoảng 1 tiếng. 



DOCUMENT
------------
 
 * Việc thu thập dữ liệu chỉ có chức năng là tham khảo và sử dụng vào mục đích **PHI LỢI ÍCH**, vui lòng xin phép phía website và trích dần nguồn đầy đủ nếu bạn có ý định sử dụng vào mục đích thu lợi ích.

 * Dữ liệu hiện được thu thập từ 3 nguồn dữ liệu sau : 
    - https://alonhadat.com.vn/
    - https://homedy.com/
    - https://phongtro123.com/
 
 * Bạn có thể bỏ qua những nguồn mình không muốn bằng cách commend `//` or xoá dòng tương ứng trong file `main.js` 
 * Hiện tại mình không thể thu thập từ `homedy.com` do trang đã chặn
  

Tip
------------
 * Đồ án này mình sử dụng cherrio tuy đơn giản nhưng sẽ không thể thu thập được những trang web mà dữ liệu được render từ js, nó cũng không thay đổi địa chỉ IP, port liên tục nên các trang website có thể dễ dàng chặn crawl được - như trang homedy.js đã làm. Tip cho bạn là nên sử dụng Scrapy của pyhon để thu thập :)). 



