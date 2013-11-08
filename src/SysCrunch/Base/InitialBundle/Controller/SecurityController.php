<?php

namespace SysCrunch\Base\InitialBundle\Controller;

use SysCrunch\Base\InitialBundle\Entity\User;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\Annotations\Prefix;
use FOS\RestBundle\Controller\Annotations\NamePrefix;
use FOS\RestBundle\View\RouteRedirectView;
use FOS\RestBundle\View\View AS FOSView;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Authentication\Token\AnonymousToken;


use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\RequestParam;
use FOS\RestBundle\Controller\Annotations\Options;
use FOS\RestBundle\Controller\Annotations\Route;



/**
 * Controller that provides Restfuls security functions.
 *
 * @Prefix("/security")
 * @NamePrefix("sc_demo_securityrest_")
 * @author Jonathan Claros <jonathan.claros@syscrunch.com>
 */
class SecurityController extends Controller
{

    /**
     * Demo API module working
     *
     * @return FOSView
     * Using param_fetcher_listener: force
     * @Route("/demo_action", options={"expose"=true})
     * @param ParamFetcher $paramFetcher Paramfetcher
     *
     * @RequestParam(name="title", requirements="\d+", default="", description="Title of the image")
     * 
     * @ApiDoc()
     */
    public function getDemoAction()
    {
        $view = FOSView::create();
        $request = $this->getRequest();
        $data = array(
            'ACK' => 'demo working'
            );
        $view->setStatusCode(200)->setData($data);
        
        return $view;
    }

    /**
     * WSSE Token generation
     *
     * @return FOSView
     * @throws AccessDeniedException
     * @ApiDoc()
     */
    public function postTokenCreateAction()
    {
        $view = FOSView::create();
        $request = $this->getRequest();

        $username = $request->get('_username');
        $password = $request->get('_password');

        //$csrfToken = $this->container->get('form.csrf_provider')->generateCsrfToken('authenticate');
        //$data = array('csrf_token' => $csrfToken,);

        $um = $this->get('fos_user.user_manager');
        $user = $um->findUserByUsernameOrEmail($username);

        if (!$user instanceof User) {

            throw new AccessDeniedException("Wrong user");
        }
        $created = date('c');
        $nonce = substr(md5(uniqid('nonce_', true)), 0, 16);
        $nonceHigh = base64_encode($nonce);
        $passwordDigest = base64_encode(sha1($nonce . $created . $password . "{".$user->getSalt()."}", true));
        $header = "UsernameToken Username=\"{$username}\", PasswordDigest=\"{$passwordDigest}\", Nonce=\"{$nonceHigh}\", Created=\"{$created}\"";
        $view->setHeader("Authorization", 'WSSE profile="UsernameToken"');
        $view->setHeader("X-WSSE", "UsernameToken Username=\"{$username}\", PasswordDigest=\"{$passwordDigest}\", Nonce=\"{$nonceHigh}\", Created=\"{$created}\"");
        $data = array('WSSE' => $header);
        $view->setStatusCode(200)->setData($data);
        //var_dump($view);die();
        return $view;
    }

    /**
     * WSSE Token Remove
     *
     * @return FOSView
     * @ApiDoc()
     */
    public function getTokenDestroyAction()
    {
        $view = FOSView::create();
        $security = $this->get('security.context');
        $token = new AnonymousToken(null, new User());
        $security->setToken($token);
        $this->get('session')->invalidate();
        $view->setStatusCode(200)->setData('Logout successful');
        return $view;
    }
}
