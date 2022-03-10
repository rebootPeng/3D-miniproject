//index.js
//获取应用实例
const app = getApp()
import { ModelRenderer } from './modelRender'
const modeldRenderer=new ModelRenderer()


Page({
  data: {
    canvasWidth: 350,
    canvasHeight: 350,
    canvasTop: 0,
    canvasLeft: 0,
  },
  onReady: async function () {
    let url='https://www.biubbmk.cn/90.gltf'
    await  modeldRenderer.run([100,0,400,400],url,this);
  },
})
