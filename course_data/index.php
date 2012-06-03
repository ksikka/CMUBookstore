<?php

set_time_limit(600); 
require('simple_html_dom.php'); 

function fst($a)
{
	return $a[0]; ;
}

$master = array(); 

$dir = dir('books');

while ($obj = $dir->read())
{
	if ($obj[0] == '.')
		continue; 
		
	$course = array(); 
	$course['books'] = array(); 

	$html = file_get_html('books/' . $obj); 
	$container = fst($html->find('dl')); 
	$title = fst($container->find('dt')); 

	// Process title
	$title = explode(' ', trim($title));
	$course['course_number'] = $title[2]; 

	// Process each book
	foreach ($container->find('dd') as $entry)
	{
		$book = array(); 
		$div_book_info = fst($entry->find('div[class=book_info]')); 
		$div_details = fst($div_book_info->find('div[class=details]')); 
		
		// Get book title
		$book['title'] = fst($div_details->find('h3'))->innertext; 
		
		$ul = fst($div_details->find('ul[class=meta]'));
		$li_fields = array('requirement', 'isbn', 'author', 'publisher',
			'pages');

		// Get book specific details
		foreach ($ul->find('li') as $li)
		{
			if (!in_array($li->class, $li_fields))
				continue; 
				
			$book[$li->class] = trim(strip_tags(fst($li->find('span[class=value]'))->innertext)); 
		}
		
		$course['books'][] = $book; 
	}
	
	file_put_contents('data/' . $obj . '.json', json_encode($course)); 
	
	//$master[] = $course;
}

$dir->close(); 

?>