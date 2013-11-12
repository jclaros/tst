<?php

namespace SysCrunch\StoreBundle\Controller;

use FOS\Rest\Util\Codes;
use Pagerfanta\Adapter\DoctrineORMAdapter;
use Pagerfanta\Pagerfanta;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Request;

use SysCrunch\StoreBundle\Entity\Template;
use SysCrunch\Base\InitialBundle\Entity\User;
use SysCrunch\StoreBundle\Form\Model\Pagination;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;


use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\RequestParam;
use FOS\RestBundle\Controller\Annotations\Options;
//use FOS\RestBundle\Controller\Annotations\Route ;

/**
 * @Route("/templates")
 */
class DefaultController extends Controller
{
  /**
   * @Method("GET")
   * @Route("/{id}", name = "api_template_get")
   */
  public function getAction(Template $template)
  {
    return $this->view($template);
  }

  /**
   * Method to retrieve list of templates
   * 
   * @Method("GET")
   * @Route("", name = "api_template_list", options={"expose"=true})
   * @param ParamFetcher $paramFetcher Paramfetcher
   * 
   * @RequestParam(name="pagination[page]", requirements="\d+", default="1", description="Requested Page")
   * @RequestParam(name="pagination[limit]", requirements="\d+", default="10", description="Limit of the results")
   * 
   * @ApiDoc()
   */
  public function getTemplatesAction(Request $request)
  {
    $paginationForm = $this->createPaginationForm($pagination = new Pagination());
    $pag = $request->get('page');
    $limit = $request->get('limit');
    if (!$paginationForm->bind($request)->isValid()) {
      return $this->view($paginationForm);
    }
    
    $templateRepository = $this->getDoctrine()->getManager()->getRepository('SysCrunchStoreBundle:Template');
    /* @var $queryBuilder \Doctrine\ORM\QueryBuilder */
    $queryBuilder = $templateRepository->createQueryBuilder('t');
    $pager = $this->createORMPager($pagination, $queryBuilder);

    $this->addBasicRelations($pager); // will add self + navigation links
    $this->addRelation($pager, 'pagination', array('route' => 'api_template_form_pagination'), array(
      'provider' => array('fsc_hateoas.factory.form_view', 'create'),
      'providerArguments' => array($paginationForm, 'GET', 'api_template_list'),
    ));
    
    return $this->view($pager);
  }

  /**
   * @Method("POST")
   * @Route("", name = "api_template_create")
   */
  public function createAction(Request $request)
  {
    $form = $this->createTemplateForm($template = new Template(), true);

    if (!$form->bind($request)->isValid()) {
      return $this->view($form);
    }

    $em = $this->getDoctrine()->getManager();
    $em->persist($template);
    $em->flush();

    return $this->redirectView($this->generateSelfUrl($template), Codes::HTTP_CREATED);
  }

  /**
   * @Method("PUT")
   * @Route("/{id}", name = "api_template_edit")
   */
  public function editAction(Template $template, Request $request)
  {
    $form = $this->createTemplateForm($template);

    if (!$form->bind($request)->isValid()) {
      return $this->view($form);
    }

    $this->getDoctrine()->getManager()->flush();

    return $this->redirectView($this->generateSelfUrl($template), Codes::HTTP_ACCEPTED);
  }

  /**
   * @Method("GET")
   * @Route("/forms/pagination", name = "api_template_form_pagination")
   */
  public function paginationFormAction()
  {
    $form = $this->createPaginationForm($pagination = new Pagination());
    $formView = $this->createFormView($form, 'GET', 'api_template_list'); // will add method/action attributes

    $this->addBasicRelations($formView); // will add self link

    return $this->view($formView);
  }

  /**
   * @Method("GET")
   * @Route("/forms/create", name = "api_template_form_create")
   */
  public function createFormAction()
  {
    $form = $this->createTemplateForm($template = new Template(), true);
    $formView = $this->createFormView($form, 'POST', 'api_template_create'); // will add method/action attributes

    $this->addBasicRelations($formView); // will add self link

    return $this->view($formView);
  }

  /**
   * @Method("GET")
   * @Route("/{id}/forms/edit", name = "api_template_form_edit")
   */
  public function editFormAction(Template $template)
  {
    $form = $this->createTemplateForm($template);
    $formView = $this->createFormView($form, 'PUT', 'api_template_edit', array('id' => $template->getId())); // will add method/action attributes

    $this->addBasicRelations($formView); // will add self link

    return $this->view($formView);
  }

  protected function createTemplateForm(Template $template, $create = false)
  {
    $options = $create ? array('is_create' => true) : array();

    return $this->createFormNamed('template', 'syscrunch_template', $template, $options);
  }

  protected function createPaginationForm(Pagination $pagination)
  {
    return $this->createFormNamed('pagination', 'syscrunch_pagination', $pagination);
  }
}
