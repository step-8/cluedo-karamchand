function sum(){
  total=0
  for count in $1
  do
    total=$((total + count))
  done

  echo ${total}
}

# Number of src files
num_of_frontend_js_files=`ls ./public/js/*.js | wc -l`
num_of_backend_js_files=`ls ./src/*/*.js ./src/*.js | wc -l`
num_of_html_files=`ls ./private/*.html | wc -l`
num_of_css_files=`ls ./public/css/*.css | wc -l`
num_of_shell_files=`ls ./bin/*.sh ./devUtils/*.sh | wc -l`

count_of_files="${num_of_frontend_js_files} ${num_of_backend_js_files} ${num_of_html_files} ${num_of_css_files} ${num_of_shell_files}"

total_src_files=`sum "${count_of_files}"`

# Number of lines of src code
num_of_frontend_js_lines=`cat ./public/js/*.js | wc -l`
num_of_backend_js_lines=`cat ./src/*/*.js ./src/*.js | wc -l`
num_of_html_lines=`cat ./private/*.html | wc -l`
num_of_css_lines=`cat public/css/*.css | wc -l`
num_of_shell_lines=`cat ./bin/*.sh ./devUtils/*.sh | wc -l`

count_of_src_lines="${num_of_frontend_js_lines} ${num_of_backend_js_lines} ${num_of_html_lines} ${num_of_css_lines} ${num_of_shell_lines}"

total_lines_of_src_code=`sum "${count_of_src_lines}"`

# Test Code
num_of_test_js_files=`ls ./test/*.js | wc -l`
num_of_test_js_lines=`cat ./test/*.js | wc -l`

# Report
echo "\n-----SOURCE CODE-----"

echo "\n--Number of Files--"
echo "Javascript (Front-End):"${num_of_frontend_js_files}
echo "Javascript (Back-End):"${num_of_backend_js_files} 
echo "HTML:"${num_of_html_files}
echo "CSS:"${num_of_css_files}
echo "Shell:"${num_of_shell_files}
echo "Total:"${total_src_files}

echo "\n--Number of Lines of Code--"
echo "Javascript (Front-End):"${num_of_frontend_js_lines} 
echo "Javascript (Back-End):"${num_of_backend_js_lines}
echo "HTML:"${num_of_html_lines}
echo "CSS:"${num_of_css_lines}
echo "Shell:"${num_of_shell_lines}
echo "Total:"${total_lines_of_src_code}

echo "\n-----TEST CODE-----"

echo "\n--Number of Files--"
echo "Javascript:"${num_of_test_js_files}

echo "\n--Number of Lines of Code--"
echo "Javascript:"${num_of_test_js_lines}

echo "\n-----TOTAL-----"
echo "Total files:" $((total_src_files + num_of_test_js_files))
echo "Total Lines of Code:" $((total_lines_of_src_code + num_of_test_js_lines))