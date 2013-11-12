<?php
namespace Acme\DemoBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Acme\DemoBundle\Form\ContactType;

// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations;

class TaskController extends FOSRestController
{
	
	/**
	 * @Annotations\View()
	 */
	public function getTasksAction() {
	    $task = new Task();
	    $task->title = 'Put';
	    $task->description = 'add put action';
	    $task->secret = 'top secret';

	    return array($task);
	}

}