>nohup.out
kill -9 $(ps -ef  | grep node | grep -v grep | awk '{print $2}') 2>/dev/null
nohup node ta4_break_watchlist.js > nohup.out &
