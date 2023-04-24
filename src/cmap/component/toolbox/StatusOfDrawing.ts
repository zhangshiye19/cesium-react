/**
 * 状态机
 * IDLE: 未进入绘画状态
 * WORKING: 正在绘画
 * END: 绘画结束状态，代表绘画最后一个节点
 */
const IDLE = 0;
const WORKING = 1;
const END = 2;

export default {
    IDLE,
    WORKING,
    END
}