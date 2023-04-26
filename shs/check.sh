#!/bin/bash
processCount=`ps -ef  | grep node | grep -v grep | wc -l`
if [ $processCount -lt 1 ]
then
	echo "$(date) - [process çalışmıyor. Rerun edilecek..." >> /root/tradeHelper/logs/killed_watch15m.log;
	/root/tradeHelper/shs/run.sh 
fi

