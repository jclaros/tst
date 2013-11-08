<?php
/**
 * theming-store-symfony
 * Owner: Jonathan Claros <jonathan.claros@syscrunch.com>
 * Date: 7/29/13
 * Time: 6:32 PM
 */

namespace SysCrunch\StoreBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use JMS\DiExtraBundle\Annotation as DI;

use SysCrunch\StoreBundle\Form\EventListener\ReplaceNotSubmittedValuesByDefaultsListener;

/**
 * @DI\FormType
 */
class PaginationType extends AbstractType
{
  /**
   * {@inheritdoc}
   */
  public function buildForm(FormBuilderInterface $builder, array $options)
  {
    $subscriber = new ReplaceNotSubmittedValuesByDefaultsListener($builder->getFormFactory());
    $builder->addEventSubscriber($subscriber);

    $builder
        ->add('page', 'hidden', array('required' => false, 'attr' => array(
          'id' => 'page',
        )))
        ->add('limit', 'hidden', array('required' => false, 'attr' => array(
          'id' => 'limit',
        )))
    ;
  }

  /**
   * {@inheritdoc}
   */
  public function setDefaultOptions(OptionsResolverInterface $resolver)
  {
    $resolver->setDefaults(array(
      'csrf_protection' => false,
      'data_class' => 'SysCrunch\\StoreBundle\\Form\\Model\\Pagination',
    ));
  }

  /**
   * {@inheritdoc}
   */
  public function getName()
  {
    return 'syscrunch_pagination';
  }
}