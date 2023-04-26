kill -9 $(ps -ef  | grep node | grep -v grep | awk '{print $2}') 2>/dev/null
cd /root/tradeHelper/scripts/executers ; nohup node ta4_watch15m.js >> /root/tradeHelper/logs/nohup.out &