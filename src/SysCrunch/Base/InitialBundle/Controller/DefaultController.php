<?php

namespace SysCrunch\Base\InitialBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('SysCrunchBaseInitialBundle:Default:index.html.twig', array('name' => $name));
    }
}
