<!--
 * @Descripttion: 文件描述
 * @Author: sola.zhang
 * @Date: 2023-07-13 11:12:52
 * @LastEditors: sola.zhang
 * @LastEditTime: 2023-07-13 15:13:00
-->
<script type="text/javascript">
// 定义一些公共的属性和方法
let title = 'SOLAの媒体库';
let apiUrl = process.env.NODE_ENV === 'production' ? "https://onelist.meaqua.fun" : "https://onelist.meaqua.fun";
// let imgUrl = "https://image.tmdb.org"
let imgUrl = "https://tmdb-image-prod.b-cdn.net"
const isMo = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
import Snackbar from 'node-snackbar';


function ShowMsg(msg) {
  Snackbar.show({ pos: 'top-center', text: msg, showAction: false });
}

function initConfig() {
  if (localStorage.getItem("title") != null) {
    title = localStorage.getItem("title")
  }
  if (localStorage.getItem("img_url") != null) {
    imgUrl = localStorage.getItem("img_url")
    if (process.env.NODE_ENV != 'production' && localStorage.getItem("img_url").length == 0) {
      imgUrl = apiUrl;
    }
  }
}

initConfig()
// 暴露出这些属性和方法
export default {
  apiUrl,
  title,
  isMo,
  imgUrl,
  ShowMsg
}
</script>
