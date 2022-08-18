#! /bin/bash

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
num_of_pug_files=`ls ./views/*.pug | wc -l`
num_of_html_files=`ls ./private/*.html | wc -l`
num_of_css_files=`ls ./public/css/*.css | wc -l`
num_of_shell_files=`ls ./bin/*.sh ./devUtils/*.sh | wc -l`

count_of_files="${num_of_frontend_js_files} ${num_of_backend_js_files} ${num_of_pug_files} ${num_of_html_files} ${num_of_css_files} ${num_of_shell_files}"

total_src_files=`sum "${count_of_files}"`

# Number of lines of src code
num_of_frontend_js_lines=`cat ./public/js/*.js | wc -l`
num_of_backend_js_lines=`cat ./src/*/*.js ./src/*.js | wc -l`
num_of_pug_lines=`cat ./views/*.pug | wc -l`
num_of_html_lines=`cat ./private/*.html | wc -l`
num_of_css_lines=`cat public/css/*.css | wc -l`
num_of_shell_lines=`cat ./bin/*.sh ./devUtils/*.sh | wc -l`

count_of_src_lines="${num_of_frontend_js_lines} ${num_of_backend_js_lines} ${num_of_pug_lines} ${num_of_html_lines} ${num_of_css_lines} ${num_of_shell_lines}"

total_lines_of_src_code=`sum "${count_of_src_lines}"`

# Test Code
num_of_test_js_files=`ls ./test/*.js | wc -l`
num_of_test_js_lines=`cat ./test/*.js | wc -l`

# Report
echo -e "\n-----SOURCE CODE-----"

echo -e "\n--Number of Files--"
echo -e "Javascript (Front-End):"${num_of_frontend_js_files}
echo -e "Javascript (Back-End):"${num_of_backend_js_files} 
echo -e "PUG:"${num_of_pug_files}
echo -e "HTML:"${num_of_html_files}
echo -e "CSS:"${num_of_css_files}
echo -e "Shell:"${num_of_shell_files}
echo -e "Total:"${total_src_files}

echo -e "\n--Number of Lines of Code--"
echo -e "Javascript (Front-End):"${num_of_frontend_js_lines} 
echo -e "Javascript (Back-End):"${num_of_backend_js_lines}
echo -e "PUG:"${num_of_pug_lines}
echo -e "HTML:"${num_of_html_lines}
echo -e "CSS:"${num_of_css_lines}
echo -e "Shell:"${num_of_shell_lines}
echo -e "Total:"${total_lines_of_src_code}

echo -e "\n-----TEST CODE-----"

echo -e "\n--Number of Files--"
echo -e "Javascript:"${num_of_test_js_files}

echo -e "\n--Number of Lines of Code--"
echo -e "Javascript:"${num_of_test_js_lines}

echo -e "\n-----TOTAL-----"
echo -e "Total files:" $((total_src_files + num_of_test_js_files))
echo -e "Total Lines of Code:" $((total_lines_of_src_code + num_of_test_js_lines))