<?php
/**
 * theming-store-symfony
 * Owner: Jonathan Claros <jonathan.claros@syscrunch.com>
 * Date: 7/29/13
 * Time: 6:17 PM
 */

namespace SysCrunch\StoreBundle\Form\Model;

use Symfony\Component\Validator\Constraints as Assert;

class Pagination
{
  /**
   * @var int
   *
   * @Assert\Range(min = 1)
   */
  private $page;

  /**
   * @var int
   *
   * @Assert\Range(min = 1)
   */
  private $limit;

  public function __construct($page = 1, $limit = 10)
  {
    $this->page = $page;
    $this->limit = $limit;
  }

  public function setLimit($limit)
  {
    $this->limit = $limit;
  }

  public function getLimit()
  {
    return $this->limit;
  }

  public function setPage($page)
  {
    $this->page = $page;
  }

  public function getPage()
  {
    return $this->page;
  }
}