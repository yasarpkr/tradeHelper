#!/bin/bash
processCount=`ps -ef  | grep node | grep -v grep | wc -l`
if [ $processCount -lt 1 ]
then
	cd /root/tradeHelper/scripts;
	echo "$(date) - [process çalışmıyor. Rerun edilecek..." >> /root/tradeHelper/scripts/logs/ta4_break_rerun.txt;
	/root/tradeHelper/scripts/run.sh &

fi
